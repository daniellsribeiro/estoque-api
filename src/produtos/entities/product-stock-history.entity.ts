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

  @Property({ type: Number, default: 0 })
  quantidadeAdicionada: number = 0;

  @Property({ type: Number, default: 0 })
  quantidadeSubtraida: number = 0;

  @Property({ fieldName: 'id_compra', nullable: true })
  compraId?: string;

  @Property({ fieldName: 'id_venda', nullable: true })
  vendaId?: string;

  @Property({ type: Date, fieldName: 'data_mudanca' })
  dataMudanca: Date = new Date();

  @Property()
  motivo: string;

  @Property({ nullable: true })
  referencia?: string;
}
