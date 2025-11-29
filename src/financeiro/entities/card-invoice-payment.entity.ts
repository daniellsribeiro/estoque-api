import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';
import { CardAccount } from './card-account.entity';

@Entity({ tableName: 'cartoes_contas_pagamentos' })
export class CardInvoicePayment extends BaseAuditEntity {
  @ManyToOne(() => CardAccount)
  cartaoConta: CardAccount;

  @Property()
  mesReferencia: string;

  @Property({ type: Date })
  dataPagamentoReal: Date;
}
