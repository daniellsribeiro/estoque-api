import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseHistoryEntity } from '../../common/entities/base-history.entity';
import { Product } from '../../produtos/entities/product.entity';
import { Sale } from './sale.entity';

@Entity({ tableName: 'estoque_baixas' })
export class StockReduction extends BaseHistoryEntity {
  @ManyToOne(() => Product)
  item: Product;

  @Property({ type: Number })
  quantidade: number;

  @Property({ type: Date })
  data: Date;

  @Property()
  motivo: string;

  @ManyToOne(() => Sale, { nullable: true })
  venda?: Sale;
}
