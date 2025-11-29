import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';
import { Sale } from '../../vendas/entities/sale.entity';
import { PaymentType } from './payment-type.entity';
import { CardAccount } from './card-account.entity';

@Entity({ tableName: 'recebimentos' })
export class Recebimento extends BaseAuditEntity {
  @ManyToOne({ nullable: true, entity: () => Sale })
  venda?: Sale;

  @ManyToOne({ nullable: true })
  tipoPagamento?: PaymentType;

  @ManyToOne({ nullable: true })
  cartaoConta?: CardAccount;

  @Property()
  parcelaNumero: number;

  @Property({ columnType: 'numeric(12,2)' })
  valorBruto: number;

  @Property({ columnType: 'numeric(12,2)', default: 0 })
  valorTaxa: number = 0;

  @Property({ columnType: 'numeric(12,2)' })
  valorLiquido: number;

  @Property({ type: Date })
  dataPrevista: Date;

  @Property({ type: Date, nullable: true })
  dataRecebida?: Date;

  @Property({ default: 'previsto' })
  status: 'previsto' | 'recebido' | 'cancelado' = 'previsto';
}
