import { Entity, Property, Unique } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';

@Entity({ tableName: 'tamanhos_produto' })
export class ProductSize extends BaseAuditEntity {
  @Property()
  nome: string;

  @Property({ length: 3 })
  @Unique()
  codigo: string;
}
