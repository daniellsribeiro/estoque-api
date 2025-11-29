import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';
import { CardAccount } from './card-account.entity';
import { Expense } from './expense.entity';
import { PaymentType } from './payment-type.entity';

@Entity({ tableName: 'gastos_pagamento' })
export class ExpensePayment extends BaseAuditEntity {
  @ManyToOne(() => Expense)
  gasto: Expense;

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
