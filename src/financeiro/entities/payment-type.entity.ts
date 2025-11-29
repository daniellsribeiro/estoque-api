import { Entity, Property } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';

@Entity({ tableName: 'tipos_pagamento' })
export class PaymentType extends BaseAuditEntity {
  @Property()
  descricao: string;

  @Property({ columnType: 'numeric(12,2)', default: 0 })
  taxaFixa: number = 0;

  @Property({ columnType: 'numeric(5,2)', default: 0 })
  taxaPercentual: number = 0;

  @Property({ columnType: 'numeric(5,2)', default: 0 })
  taxaParcela: number = 0;

  @Property({ columnType: 'numeric(5,2)', default: 0 })
  descontoPercentual: number = 0;

  @Property({ default: false })
  parcelavel: boolean = false;

  @Property({ default: 1 })
  minParcelas: number = 1;

  @Property({ default: 1 })
  maxParcelas: number = 1;

  @Property({ default: true })
  ativo: boolean = true;
}
