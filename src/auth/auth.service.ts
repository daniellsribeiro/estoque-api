import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private buildToken(user: any) {
    const payload = { sub: user.id, email: user.email, name: user.name };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        active: user.active,
      },
    };
  }

  async register(dto: RegisterDto) {
    const totalUsers = await this.usersService.count();
    if (totalUsers > 0) {
      throw new ForbiddenException(
        'Somente usuários autenticados podem criar novos usuários. Use /users',
      );
    }

    const user = await this.usersService.create(
      { name: dto.name, email: dto.email, password: dto.password },
      undefined,
    );
    return this.buildToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    if (!user.active) {
      throw new ForbiddenException('Usuário inativo');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.buildToken(user);
  }

  async me(user: any) {
    if (!user?.id) {
      throw new UnauthorizedException();
    }
    const found = await this.usersService.findById(user.id);
    if (!found) {
      throw new UnauthorizedException();
    }
    return {
      id: found.id,
      name: found.name,
      email: found.email,
      active: found.active,
    };
  }
}
