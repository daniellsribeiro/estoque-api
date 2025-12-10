import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';
import { PaymentType } from '../../financeiro/entities/payment-type.entity';
import { Customer } from '../../produtos/entities/customer.entity';
import { SaleItem } from './sale-item.entity';

@Entity({ tableName: 'vendas' })
export class Sale extends BaseAuditEntity {
  @Property({ type: Date })
  data: Date;

  @ManyToOne(() => Customer)
  cliente: Customer;

  @ManyToOne(() => PaymentType)
  tipoPagamento: PaymentType;

  @Property({ default: 1 })
  parcelas: number = 1;

  @Property({ columnType: 'numeric(12,2)', default: 0 })
  frete: number = 0;

  @Property({ columnType: 'numeric(12,2)', default: 0 })
  descontoTotal: number = 0;

  @Property({ columnType: 'numeric(12,2)' })
  totalVenda: number;

  @Property({ columnType: 'numeric(12,2)', default: 0 })
  valorLiquido: number = 0;

  @Property()
  status: string;

  @Property({ nullable: true })
  observacoes?: string;

  @OneToMany(() => SaleItem, (item) => item.venda)
  itens = new Collection<SaleItem>(this);
}
