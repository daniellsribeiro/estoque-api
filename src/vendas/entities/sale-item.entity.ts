import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';
import { Product } from '../../produtos/entities/product.entity';
import { Sale } from './sale.entity';

@Entity({ tableName: 'vendas_itens' })
export class SaleItem extends BaseAuditEntity {
  @ManyToOne(() => Sale)
  venda: Sale;

  @ManyToOne(() => Product)
  item: Product;

  @Property({ type: Number })
  qtde: number;

  @Property({ columnType: 'numeric(12,2)' })
  precoUnit: number;

  @Property({ columnType: 'numeric(12,2)' })
  subtotal: number;
}
