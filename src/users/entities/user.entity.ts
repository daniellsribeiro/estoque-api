import { Entity, Property, Unique } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';

@Entity({ tableName: 'users' })
export class User extends BaseAuditEntity {
  @Property()
  name: string;

  @Property()
  @Unique()
  email: string;

  @Property({ hidden: true })
  passwordHash: string;

  @Property({ default: true })
  active: boolean = true;
}
