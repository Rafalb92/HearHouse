// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { REFRESH_STRATEGY, COOKIE_ACCESS, COOKIE_REFRESH } from './constants';
import { JwtAccessPayload, JwtRefreshPayload } from './types/jwt-payloads';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from '@/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import type { AuthUser } from './types/auth-user.type';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  cookieBaseOptions,
  cookieMaxAgeAccess,
  cookieMaxAgeRefresh,
} from './utils/cookies';

// ===== BEZPOŚREDNI IMPORT - to działa! =====
import { generateCsrfToken } from '@/common/csrf/csrf.config';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AddPasswordDto } from './dto/add-password.dto';
import { ConfirmLinkDto } from './dto/confirm-link.dto';
// ===========================================

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  @Get('csrf-token')
  getCsrfToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // ✅ Używamy importowanej funkcji bezpośrednio
    const csrfToken = generateCsrfToken(req, res);
    return { csrfToken };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as User;

    const result = await this.auth.issueTokens(user, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user };
  }

  @Post('refresh')
  @UseGuards(AuthGuard(REFRESH_STRATEGY))
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshPayload = req.user as JwtRefreshPayload;
    const result = await this.auth.refresh(refreshPayload, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshName =
      this.config.get<string>('COOKIE_REFRESH_NAME') ?? COOKIE_REFRESH;
    const token = req.cookies?.[refreshName] as string | undefined;

    if (token) {
      try {
        const payload = await this.jwt.verifyAsync<JwtRefreshPayload>(token, {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        });
        await this.auth.logout(payload);
      } catch {
        // token invalid/expired -> ignore, still clear cookies
      }
    }

    this.clearAuthCookies(res);
    return { ok: true };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  async logoutAll(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logoutAll(user.id);
    this.clearAuthCookies(res);
    return { ok: true };
  }

  @Get('session')
  async session(@Req() req: Request) {
    const accessName =
      this.config.get<string>('COOKIE_ACCESS_NAME') ?? 'access_token';
    const token = req.cookies?.[accessName] as string | undefined;

    if (!token) return { user: null };

    try {
      const payload = await this.jwt.verifyAsync<JwtAccessPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      return { user: this.auth.validateAccessPayload(payload) };
    } catch {
      return { user: null };
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.token, dto.password);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
    // Wyczyść cookies bo wszystkie sesje zostały unieważnione
    this.clearAuthCookies(res);
    return { ok: true };
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.auth.verifyEmail(dto.token);
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  async resendVerification(@CurrentUser() user: AuthUser) {
    await this.auth.sendVerificationEmail(user.id);
    return { ok: true };
  }

  // ---Google OAuth routes---
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Passport redirect do Google — ciało niepotrzebne
  }

  // Callback Google — obsługa requires_linking
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const result = req.user as
      | { status: 'ok'; user: User }
      | { status: 'requires_linking'; linkToken: string; email: string };

    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';

    if (result.status === 'requires_linking') {
      // Redirect z tokenem — frontend pokaże modal z prośbą o hasło
      return res.redirect(
        `${frontendUrl}/auth/link-account?token=${result.linkToken}&email=${encodeURIComponent(result.email)}`,
      );
    }

    const tokens = await this.auth.issueTokens(result.user, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    res.redirect(`${frontendUrl}/auth/callback?status=success`);
  }

  // Potwierdź linkowanie przez hasło
  @Post('link/confirm')
  async confirmLink(
    @Body() dto: ConfirmLinkDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.confirmLinkGoogle(
      dto.linkToken,
      dto.password,
      { ip: req.ip, userAgent: req.headers['user-agent'] },
    );
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user };
  }

  // Dodaj hasło (zalogowany user bez hasła)
  @Post('add-password')
  @UseGuards(JwtAuthGuard)
  async addPassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: AddPasswordDto,
  ) {
    return this.auth.addPassword(user.id, dto.password);
  }

  // Odłącz provider
  @Delete('unlink/:provider')
  @UseGuards(JwtAuthGuard)
  async unlinkProvider(
    @CurrentUser() user: AuthUser,
    @Param('provider') provider: string,
  ) {
    return this.auth.unlinkProvider(user.id, provider);
  }

  // Pobierz podpięte konta
  @Get('linked-accounts')
  @UseGuards(JwtAuthGuard)
  async linkedAccounts(@CurrentUser() user: AuthUser) {
    return this.auth.getLinkedAccounts(user.id);
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const base = cookieBaseOptions(this.config);
    const accessName =
      this.config.get<string>('COOKIE_ACCESS_NAME') ?? COOKIE_ACCESS;
    const refreshName =
      this.config.get<string>('COOKIE_REFRESH_NAME') ?? COOKIE_REFRESH;

    res.cookie(accessName, accessToken, {
      ...base,
      maxAge: cookieMaxAgeAccess(this.config),
    });
    res.cookie(refreshName, refreshToken, {
      ...base,
      maxAge: cookieMaxAgeRefresh(this.config),
    });
  }

  private clearAuthCookies(res: Response) {
    const base = cookieBaseOptions(this.config);
    const accessName =
      this.config.get<string>('COOKIE_ACCESS_NAME') ?? COOKIE_ACCESS;
    const refreshName =
      this.config.get<string>('COOKIE_REFRESH_NAME') ?? COOKIE_REFRESH;

    res.clearCookie(accessName, { ...base });
    res.clearCookie(refreshName, { ...base });
  }
}
