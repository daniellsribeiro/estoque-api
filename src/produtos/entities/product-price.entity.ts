import { Entity, OneToOne, Property } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';
import { Product } from './product.entity';

@Entity({ tableName: 'precos_produto' })
export class ProductPrice extends BaseAuditEntity {
  @OneToOne(() => Product, { owner: true, unique: true })
  produto: Product;

  @Property({ columnType: 'numeric(12,2)' })
  precoVendaAtual: number;
}
