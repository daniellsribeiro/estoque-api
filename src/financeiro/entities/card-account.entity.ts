import { Entity, Property } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';

@Entity({ tableName: 'cartoes_contas' })
export class CardAccount extends BaseAuditEntity {
  @Property()
  nome: string;

  @Property({ nullable: true })
  banco?: string;

  @Property({ nullable: true })
  bandeira?: string;

  @Property({ nullable: true })
  diaFechamento?: number;

  @Property({ nullable: true })
  diaVencimento?: number;

  @Property({ nullable: true })
  pixChave?: string;

  @Property({ default: true })
  ativo: boolean = true;
}
