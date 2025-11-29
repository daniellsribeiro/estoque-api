import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  Property,
  Unique,
} from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';
import { ProductColor } from './product-color.entity';
import { ProductMaterial } from './product-material.entity';
import { ProductSize } from './product-size.entity';
import { ProductType } from './product-type.entity';
import { ProductDiscount } from './product-discount.entity';
import { ProductPrice } from './product-price.entity';
import { ProductPriceHistory } from './product-price-history.entity';
import { ProductStock } from './product-stock.entity';

@Entity({ tableName: 'produtos' })
export class Product extends BaseAuditEntity {
  @Property({ unique: true })
  @Unique()
  codigo: string;

  @Property()
  nome: string;

  @ManyToOne(() => ProductType)
  tipo: ProductType;

  @ManyToOne(() => ProductColor, { nullable: true })
  cor?: ProductColor;

  @ManyToOne(() => ProductMaterial, { nullable: true })
  material?: ProductMaterial;

  @ManyToOne(() => ProductSize, { nullable: true })
  tamanho?: ProductSize;

  @Property({ nullable: true })
  observacao?: string;

  @Property({ default: true })
  ativo: boolean = true;

  @OneToOne(() => ProductStock, (stock) => stock.produto, {
    nullable: true,
    owner: false,
  })
  estoque?: ProductStock;

  @OneToOne(() => ProductPrice, (price) => price.produto, {
    nullable: true,
    owner: false,
  })
  preco?: ProductPrice;

  @OneToMany(() => ProductDiscount, (discount) => discount.produto)
  descontos = new Collection<ProductDiscount>(this);

  @OneToMany(() => ProductPriceHistory, (history) => history.produto)
  historicos = new Collection<ProductPriceHistory>(this);
}
