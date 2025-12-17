import { Entity, Property } from '@mikro-orm/core';
import { BaseAuditEntity } from '../common/entities/base.entity';

@Entity({ tableName: 'preferences' })
export class Preference extends BaseAuditEntity {
  @Property({ type: 'integer', default: 0 })
  alertaEstoque: number = 0;
}

