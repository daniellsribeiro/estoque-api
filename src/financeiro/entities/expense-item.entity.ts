import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';
import { Expense } from './expense.entity';

@Entity({ tableName: 'gastos_itens' })
export class ExpenseItem extends BaseAuditEntity {
  @ManyToOne(() => Expense)
  gasto: Expense;

  @Property()
  descricaoItem: string;

  @Property({ type: Number })
  qtde: number;

  @Property({ columnType: 'numeric(12,2)' })
  valorUnit: number;

  @Property({ columnType: 'numeric(12,2)' })
  valorTotal: number;
}
