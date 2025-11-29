import { BeforeUpdate, Entity, OneToOne, Property } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';
import { ProductStockHistory } from './product-stock-history.entity';
import { Product } from './product.entity';

@Entity({ tableName: 'estoque_produtos' })
export class ProductStock extends BaseAuditEntity {
  @OneToOne(() => Product, { owner: true, unique: true })
  produto: Product;

  @Property({ type: Number })
  quantidadeAtual: number;

  @BeforeUpdate()
  registerHistory(args: any) {
    const history = new ProductStockHistory();
    history.produto = this.produto;
    history.quantidadeAnterior =
      args?.changeSet?.originalEntity?.quantidadeAtual ?? this.quantidadeAtual;
    history.quantidadeNova = this.quantidadeAtual;
    history.motivo = 'ATUALIZACAO';
    history.referencia = undefined;
    history.createdById = this.updatedById ?? this.createdById;
    args.em.persist(history);
  }
}
