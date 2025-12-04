import { Entity, Property } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';

@Entity({ tableName: 'tipos_pagamento' })
export class PaymentType extends BaseAuditEntity {
  @Property()
  descricao: string;

  @Property({ default: true })
  ativo: boolean = true;
}
