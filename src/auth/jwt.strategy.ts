import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AUTH_COOKIE_NAME } from './auth.constants';
import { JwtPayload } from './jwt-payload.interface';

const extractTokenFromCookie = (req: Request): string | null => {
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return null;
  const entries = cookieHeader
    .split(';')
    .map((chunk) => chunk.trim())
    .map((chunk) => {
      const idx = chunk.indexOf('=');
      if (idx === -1) return null;
      const name = chunk.slice(0, idx);
      const value = chunk.slice(idx + 1);
      return [name, value] as const;
    })
    .filter(Boolean) as [string, string][];
  const cookies = Object.fromEntries(entries);
  const token = cookies[AUTH_COOKIE_NAME];
  return token ? decodeURIComponent(token) : null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractTokenFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'dev-secret',
    });
  }

  async validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email, name: payload.name };
  }
}
