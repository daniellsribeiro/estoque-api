import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';
import { Supplier } from '../../produtos/entities/supplier.entity';
import { PaymentType } from './payment-type.entity';
import { ExpenseItem } from './expense-item.entity';
import { ExpensePayment } from './expense-payment.entity';

@Entity({ tableName: 'gastos' })
export class Expense extends BaseAuditEntity {
  @Property({ type: Date })
  data: Date;

  @ManyToOne(() => Supplier, { nullable: true })
  fornecedor?: Supplier;

  @ManyToOne(() => PaymentType)
  tipoPagamento: PaymentType;

  @Property({ default: 1 })
  parcelas: number = 1;

  @Property({ columnType: 'numeric(12,2)' })
  totalGasto: number;

  @Property()
  status: string;

  @Property({ nullable: true })
  observacoes?: string;

  @OneToMany(() => ExpenseItem, (item) => item.gasto)
  itens = new Collection<ExpenseItem>(this);

  @OneToMany(() => ExpensePayment, (pagamento) => pagamento.gasto)
  pagamentos = new Collection<ExpensePayment>(this);
}
