import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';
import { CardAccount } from '../../financeiro/entities/card-account.entity';
import { PaymentType } from '../../financeiro/entities/payment-type.entity';
import { Supplier } from '../../produtos/entities/supplier.entity';
import { PurchaseItem } from './purchase-item.entity';
import { PurchasePayment } from './purchase-payment.entity';

@Entity({ tableName: 'compras' })
export class Purchase extends BaseAuditEntity {
  @Property({ type: Date })
  data: Date;

  @ManyToOne(() => Supplier)
  fornecedor: Supplier;

  @ManyToOne(() => PaymentType)
  tipoPagamento: PaymentType;

  @ManyToOne(() => CardAccount, { nullable: true })
  cartaoConta?: CardAccount;

  @Property({ default: 1 })
  parcelas: number = 1;

  @Property({ columnType: 'numeric(12,2)', fieldName: 'total_compra' })
  totalCompra: number = 0;

  @Property()
  status: string;

  @Property({ nullable: true })
  observacoes?: string;

  @OneToMany(() => PurchaseItem, (item) => item.compra)
  itens = new Collection<PurchaseItem>(this);

  @OneToMany(() => PurchasePayment, (pagamento) => pagamento.compra)
  pagamentos = new Collection<PurchasePayment>(this);
}
