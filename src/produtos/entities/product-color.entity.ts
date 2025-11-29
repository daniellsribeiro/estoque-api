import { Entity, Property, Unique } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';

@Entity({ tableName: 'cores_produto' })
export class ProductColor extends BaseAuditEntity {
  @Property()
  nome: string;

  @Property({ length: 3 })
  @Unique()
  codigo: string;
}
