import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Preference } from './preference.entity';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectRepository(Preference)
    private readonly preferenceRepo: EntityRepository<Preference>,
  ) {}

  private async getOrCreate(): Promise<Preference> {
    const existing = await this.preferenceRepo.findAll({ limit: 1 });
    let pref = existing[0];
    if (!pref) {
      pref = this.preferenceRepo.create({ alertaEstoque: 0 });
      await this.preferenceRepo.getEntityManager().persistAndFlush(pref);
    }
    return pref;
  }

  async find(): Promise<Preference> {
    return this.getOrCreate();
  }

  async update(alertaEstoque: number, actorId?: string) {
    const pref = await this.getOrCreate();
    pref.alertaEstoque = alertaEstoque;
    pref.updatedById = actorId;
    await this.preferenceRepo.getEntityManager().persistAndFlush(pref);
    return pref;
  }
}
