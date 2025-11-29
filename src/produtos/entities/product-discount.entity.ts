import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';
import { Product } from './product.entity';

@Entity({ tableName: 'descontos_produto' })
export class ProductDiscount extends BaseAuditEntity {
  @ManyToOne(() => Product)
  produto: Product;

  @Property({ columnType: 'numeric(12,2)' })
  precoPromocional: number;

  @Property({ type: Date })
  dataInicio: Date;

  @Property({ type: Date })
  dataFim: Date;

  @Property({ default: true })
  ativo: boolean = true;
}
