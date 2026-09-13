import {
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request, Response, CookieOptions } from "express";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import { Public } from "../common/decorators/public.decorator.js";
import type { AuthenticatedUser } from "../common/types/authenticated-user.js";
import { AuthService } from "./auth.service.js";
import { ForgotPasswordDto, LoginDto, RegisterDto } from "./auth.dto.js";

const cookieName = "cynova_refresh";
@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Public()
  @Post("register")
  @ApiOperation({ summary: "Create an account and refresh session" })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ) {
    const result = await this.auth.register(dto, {
      userAgent: req.headers["user-agent"],
      ipAddress: ip,
    });
    this.setRefresh(res, result.refreshToken);
    return { user: result.user, accessToken: result.accessToken };
  }
  @Public()
  @HttpCode(200)
  @Post("login")
  @ApiOperation({ summary: "Authenticate with email and password" })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ) {
    const result = await this.auth.login(dto, {
      userAgent: req.headers["user-agent"],
      ipAddress: ip,
    });
    this.setRefresh(res, result.refreshToken);
    return { user: result.user, accessToken: result.accessToken };
  }
  @Public() @HttpCode(200) @Post("refresh") async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ) {
    const result = await this.auth.refresh(
      req.cookies?.[cookieName] as string | undefined,
      { userAgent: req.headers["user-agent"], ipAddress: ip },
    );
    this.setRefresh(res, result.refreshToken);
    return { accessToken: result.accessToken };
  }
  @Public() @HttpCode(204) @Post("logout") async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logout(req.cookies?.[cookieName] as string | undefined);
    res.clearCookie(cookieName, this.cookieOptions());
  }
  @ApiBearerAuth() @HttpCode(204) @Post("logout-all") async logoutAll(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logoutAll(user.id);
    res.clearCookie(cookieName, this.cookieOptions());
  }
  @ApiBearerAuth() @Get("me") me(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.me(user.id);
  }
  @Public() @HttpCode(202) @Post("forgot-password") forgot(
    @Body() dto: ForgotPasswordDto,
  ) {
    return this.auth.forgotPassword(dto.email);
  }
  private setRefresh(response: Response, token: string) {
    response.cookie(cookieName, token, this.cookieOptions());
  }
  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: (process.env.COOKIE_SAME_SITE ??
        "lax") as CookieOptions["sameSite"],
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: `/${(process.env.API_PREFIX ?? "api/v1").replace(/^\/+|\/+$/g, "")}/auth`,
      maxAge: ttlSecondsForCookie(process.env.JWT_REFRESH_TTL ?? "14d") * 1000,
    };
  }
}
function ttlSecondsForCookie(value: string) {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) return 1_209_600;
  return Number(match[1]) * ({ s: 1, m: 60, h: 3600, d: 86400 }[match[2]] ?? 1);
}
