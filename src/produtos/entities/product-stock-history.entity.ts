import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseHistoryEntity } from '../../common/entities/base-history.entity';
import { Product } from './product.entity';

@Entity({ tableName: 'estoque_historico' })
export class ProductStockHistory extends BaseHistoryEntity {
  @ManyToOne(() => Product)
  produto: Product;

  @Property({ type: Number })
  quantidadeAnterior: number;

  @Property({ type: Number })
  quantidadeNova: number;

  @Property()
  motivo: string;

  @Property({ nullable: true })
  referencia?: string;
}
