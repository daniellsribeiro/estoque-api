import { Entity, Property, Unique } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';

@Entity({ tableName: 'fornecedores' })
export class Supplier extends BaseAuditEntity {
  @Property()
  @Unique()
  nome: string;

  @Property({ nullable: true })
  endereco?: string;

  @Property({ nullable: true })
  telefone?: string;

  @Property({ nullable: true })
  email?: string;

  @Property({ nullable: true })
  observacoes?: string;

  @Property({ type: Boolean, default: true })
  principal: boolean = true;
}
