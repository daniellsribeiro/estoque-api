import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async create(dto: CreateUserDto, actorId?: string) {
    const existing = await this.userRepository.findOne({ email: dto.email });
    if (existing) {
      throw new BadRequestException('E-mail já cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      active: dto.active ?? true,
      createdById: actorId,
      updatedById: actorId,
    });
    await this.userRepository.getEntityManager().persistAndFlush(user);
    return user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ email });
  }

  async findById(id: string) {
    return this.userRepository.findOne({ id });
  }

  async findAll() {
    return this.userRepository.findAll();
  }

  async count() {
    return this.userRepository.count();
  }

  async ensureActiveUser(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    if (!user.active) {
      throw new BadRequestException('Usuário inativo');
    }
    return user;
  }
}
