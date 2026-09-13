import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator.js";
import type { AuthenticatedUser } from "../types/authenticated-user.js";

interface AccessClaims {
  sub: string;
  sid: string;
  role: "USER" | "ADMIN";
  type: "access";
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}
  async canActivate(context: ExecutionContext) {
    if (
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
    )
      return true;
    const request = context.switchToHttp().getRequest<Request>() as Request & {
      user?: AuthenticatedUser;
    };
    const [scheme, token] = request.headers.authorization?.split(" ") ?? [];
    if (scheme !== "Bearer" || !token)
      throw new UnauthorizedException("A valid access token is required.");
    try {
      const claims = await this.jwt.verifyAsync<AccessClaims>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
      });
      if (claims.type !== "access") throw new Error("Wrong token type");
      request.user = {
        id: claims.sub,
        sessionId: claims.sid,
        role: claims.role,
      };
      return true;
    } catch {
      throw new UnauthorizedException(
        "The access token is invalid or expired.",
      );
    }
  }
}
