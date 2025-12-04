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
    const oldQty = args?.changeSet?.originalEntity?.quantidadeAtual ?? this.quantidadeAtual;
    const newQty = this.quantidadeAtual;
    const history = new ProductStockHistory();
    history.produto = this.produto;
    history.quantidadeAnterior = oldQty;
    history.quantidadeNova = newQty;
    const diff = newQty - oldQty;
    history.quantidadeAdicionada = diff > 0 ? diff : 0;
    history.quantidadeSubtraida = diff < 0 ? Math.abs(diff) : 0;
    history.motivo = 'ATUALIZACAO';
    history.referencia = undefined;
    history.dataMudanca = new Date();
    history.createdById = this.updatedById ?? this.createdById;
    args.em.persist(history);
  }
}
