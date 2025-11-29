import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';
import { CardAccount } from '../../financeiro/entities/card-account.entity';
import { PaymentType } from '../../financeiro/entities/payment-type.entity';
import { Purchase } from './purchase.entity';

@Entity({ tableName: 'compras_pagamento' })
export class PurchasePayment extends BaseAuditEntity {
  @ManyToOne(() => Purchase)
  compra: Purchase;

  @Property()
  nParcela: number;

  @Property({ type: Date })
  dataVencimento: Date;

  @Property({ columnType: 'numeric(12,2)' })
  valorParcela: number;

  @Property()
  statusPagamento: string;

  @Property({ type: Date, nullable: true })
  dataPagamento?: Date;

  @ManyToOne(() => PaymentType)
  tipoPagamento: PaymentType;

  @ManyToOne(() => CardAccount, { nullable: true })
  cartaoConta?: CardAccount;

  @Property({ nullable: true })
  observacoes?: string;
}
