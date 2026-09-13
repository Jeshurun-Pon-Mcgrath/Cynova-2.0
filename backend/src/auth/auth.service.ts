import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { hash, verify, argon2id } from "argon2";
import { createHash, randomUUID } from "node:crypto";
import { Attribute, UserRole } from "../../generated/prisma/enums.js";
import { PrismaService } from "../database/prisma.service.js";
import type { LoginDto, RegisterDto } from "./auth.dto.js";
import {
  PASSWORD_RECOVERY_PORT,
  type PasswordRecoveryPort,
} from "./password-recovery.port.js";

interface TokenClaims {
  sub: string;
  sid: string;
  jti: string;
  role: UserRole;
  type: "refresh";
}
interface ClientMetadata {
  userAgent?: string;
  ipAddress?: string;
}

const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const ttlSeconds = (value: string) => {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) throw new Error("JWT TTL must look like 15m or 14d");
  return Number(match[1]) * ({ s: 1, m: 60, h: 3600, d: 86400 }[match[2]] ?? 1);
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    @Inject(PASSWORD_RECOVERY_PORT)
    private readonly recovery: PasswordRecoveryPort,
  ) {}

  async register(dto: RegisterDto, metadata: ClientMetadata) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing)
      throw new ConflictException("An account with this email already exists.");
    const passwordHash = await hash(dto.password, {
      type: argon2id,
      memoryCost: 19_456,
      timeCost: 2,
      parallelism: 1,
    });
    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          passwordHash,
          profile: { create: { displayName: dto.name.trim() } },
          streak: { create: {} },
          preference: { create: {} },
        },
        select: {
          id: true,
          email: true,
          role: true,
          profile: { select: { displayName: true } },
        },
      });
      await tx.playerAttribute.createMany({
        data: Object.values(Attribute).map((attribute) => ({
          userId: created.id,
          attribute,
        })),
      });
      await tx.activityEvent.create({
        data: { userId: created.id, kind: "AUTH", text: "Account created" },
      });
      return created;
    });
    const tokens = await this.createSession(user.id, user.role, metadata);
    return {
      user: { id: user.id, email: user.email, name: user.profile!.displayName },
      ...tokens,
    };
  }

  async login(dto: LoginDto, metadata: ClientMetadata) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
      include: { profile: true },
    });
    if (
      !user ||
      user.status !== "ACTIVE" ||
      !(await verify(user.passwordHash, dto.password))
    )
      throw new UnauthorizedException("Email or password is incorrect.");
    const tokens = await this.createSession(user.id, user.role, metadata);
    return {
      user: { id: user.id, email: user.email, name: user.profile!.displayName },
      ...tokens,
    };
  }

  async refresh(token: string | undefined, metadata: ClientMetadata) {
    if (!token) throw new UnauthorizedException("Refresh token is missing.");
    let claims: TokenClaims;
    try {
      claims = await this.jwt.verifyAsync<TokenClaims>(token, {
        secret: process.env.JWT_REFRESH_SECRET,
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
      });
    } catch {
      throw new UnauthorizedException("Refresh token is invalid or expired.");
    }
    if (claims.type !== "refresh")
      throw new UnauthorizedException("Refresh token is invalid.");
    const session = await this.prisma.authSession.findUnique({
      where: { id: claims.sid },
      include: { user: true },
    });
    if (
      !session ||
      session.userId !== claims.sub ||
      session.jti !== claims.jti ||
      session.expiresAt <= new Date()
    )
      throw new UnauthorizedException("Refresh session is invalid.");
    if (session.revokedAt) {
      await this.prisma.authSession.updateMany({
        where: { familyId: session.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException(
        "Refresh token reuse detected. Sign in again.",
      );
    }
    if (digest(token) !== session.refreshTokenHash)
      throw new UnauthorizedException("Refresh token is invalid.");
    return this.prisma.$transaction(async (tx) => {
      const replacement = await this.issueTokens(
        session.userId,
        session.user.role,
        session.familyId,
      );
      const revoked = await tx.authSession.updateMany({
        where: { id: session.id, revokedAt: null },
        data: {
          revokedAt: new Date(),
          replacedById: replacement.session.id,
          lastUsedAt: new Date(),
        },
      });
      if (revoked.count !== 1)
        throw new UnauthorizedException("Refresh token has already been used.");
      await tx.authSession.create({
        data: { ...replacement.session, ...metadata },
      });
      return {
        accessToken: replacement.accessToken,
        refreshToken: replacement.refreshToken,
      };
    });
  }

  async logout(token: string | undefined) {
    if (!token) return;
    try {
      const claims = await this.jwt.verifyAsync<TokenClaims>(token, {
        secret: process.env.JWT_REFRESH_SECRET,
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
        ignoreExpiration: true,
      });
      await this.prisma.authSession.updateMany({
        where: { id: claims.sid, userId: claims.sub, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      return;
    }
  }
  async logoutAll(userId: string) {
    await this.prisma.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { profile: true },
    });
    return { id: user.id, email: user.email, name: user.profile!.displayName };
  }
  async forgotPassword(email: string) {
    await this.recovery.request(email.trim().toLowerCase());
    return {
      message:
        "If an eligible account exists, recovery instructions will be sent when password recovery is configured.",
    };
  }

  private async createSession(
    userId: string,
    role: UserRole,
    metadata: ClientMetadata,
  ) {
    const issued = await this.issueTokens(userId, role, randomUUID());
    await this.prisma.authSession.create({
      data: { ...issued.session, ...metadata },
    });
    return {
      accessToken: issued.accessToken,
      refreshToken: issued.refreshToken,
    };
  }
  private async issueTokens(userId: string, role: UserRole, familyId: string) {
    const sessionId = randomUUID();
    const jti = randomUUID();
    const accessToken = await this.jwt.signAsync(
      { sub: userId, sid: sessionId, jti: randomUUID(), role, type: "access" },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
        expiresIn: ttlSeconds(process.env.JWT_ACCESS_TTL ?? "15m"),
      },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, sid: sessionId, jti, role, type: "refresh" },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
        expiresIn: ttlSeconds(process.env.JWT_REFRESH_TTL ?? "14d"),
      },
    );
    return {
      accessToken,
      refreshToken,
      session: {
        id: sessionId,
        userId,
        familyId,
        jti,
        refreshTokenHash: digest(refreshToken),
        expiresAt: new Date(
          Date.now() + ttlSeconds(process.env.JWT_REFRESH_TTL ?? "14d") * 1000,
        ),
      },
    };
  }
}
