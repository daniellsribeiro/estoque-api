import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';
import { Product } from '../../produtos/entities/product.entity';
import { Purchase } from './purchase.entity';

@Entity({ tableName: 'compras_itens' })
export class PurchaseItem extends BaseAuditEntity {
  @ManyToOne(() => Purchase)
  compra: Purchase;

  @ManyToOne(() => Product)
  item: Product;

  @Property({ type: Number })
  qtde: number;

  @Property({ columnType: 'numeric(12,2)' })
  valorUnit: number;

  @Property({ columnType: 'numeric(12,2)' })
  valorTotal: number;
}
