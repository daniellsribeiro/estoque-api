import { Entity, Property, Unique } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';

@Entity({ tableName: 'materiais_produto' })
export class ProductMaterial extends BaseAuditEntity {
  @Property()
  nome: string;

  @Property({ length: 3 })
  @Unique()
  codigo: string;
}
