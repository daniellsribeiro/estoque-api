import { Entity, Property, Unique } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';

@Entity({ tableName: 'tipos_produto' })
export class ProductType extends BaseAuditEntity {
  @Property()
  nome: string;

  @Property({ length: 2 })
  @Unique()
  codigo: string;
}
