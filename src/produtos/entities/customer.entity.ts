import { Entity, Property } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';

@Entity({ tableName: 'clientes' })
export class Customer extends BaseAuditEntity {
  @Property()
  nome: string;

  @Property({ nullable: true })
  telefone?: string;

  @Property({ nullable: true })
  email?: string;

  @Property({ nullable: true })
  observacoes?: string;
}
