import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseHistoryEntity } from '../../common/entities/base-history.entity';
import { Product } from './product.entity';

@Entity({ tableName: 'precos_produto_historico' })
export class ProductPriceHistory extends BaseHistoryEntity {
  @ManyToOne(() => Product, { inversedBy: 'historicos' })
  produto: Product;

  @Property({ columnType: 'numeric(12,2)' })
  precoAntigo: number;

  @Property({ columnType: 'numeric(12,2)' })
  precoNovo: number;

  @Property({ type: Date })
  dataInicio: Date;

  @Property({ type: Date, nullable: true })
  dataFim?: Date;

  @Property({ nullable: true })
  motivo?: string;
}
