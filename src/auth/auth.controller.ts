import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { CookieOptions, Response } from 'express';
import { AUTH_COOKIE_NAME } from './auth.constants';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const parseExpirationToMs = (value?: string | number | null): number => {
  if (typeof value === 'number') {
    return value * 1000;
  }
  const raw = (value || '').toString().trim();
  const match = raw.match(/^(\d+)([smhd])?$/i);
  if (!match) return ONE_DAY_MS;
  const amount = Number(match[1]);
  const unit = match[2]?.toLowerCase() || 's';
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: ONE_DAY_MS,
  };
  return amount * (multipliers[unit] ?? 1000);
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private setAuthCookie(res: Response, token: string, persistent = true) {
    const expiresIn = this.configService.get('JWT_EXPIRES_IN');
    const maxAge = parseExpirationToMs(expiresIn);
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.configService.get('NODE_ENV') === 'production',
      path: '/',
    };
    if (persistent) {
      cookieOptions.maxAge = maxAge;
    }
    res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);
  }

  private clearAuthCookie(res: Response) {
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.configService.get('NODE_ENV') === 'production',
      path: '/',
    });
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.register(dto);
    this.setAuthCookie(res, data.accessToken);
    return data;
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.login(dto);
    this.setAuthCookie(res, data.accessToken, !!dto.rememberMe);
    return data;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: any) {
    return this.authService.me(user);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    this.clearAuthCookie(res);
    return { success: true };
  }
}
