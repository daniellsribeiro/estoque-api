import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseAuditEntity } from '../../common/entities/base.entity';
import { CardAccount } from './card-account.entity';

@Entity({ tableName: 'card_payment_rules' })
export class CardPaymentRule extends BaseAuditEntity {
  @ManyToOne(() => CardAccount)
  cartao: CardAccount;

  // Ex.: debito, credito_vista, credito_2_6, credito_7_12, pix_cartao
  @Property()
  tipo: string;

  @Property({ columnType: 'numeric(5,2)', default: 0 })
  taxaPercentual: number = 0;

  @Property({ columnType: 'numeric(12,2)', default: 0 })
  taxaFixa: number = 0;

  @Property({ columnType: 'numeric(5,2)', default: 0 })
  adicionalParcela: number = 0;

  @Property({ default: 0 })
  prazoRecebimentoDias: number = 0;

  // Se true, aplicar regra 1ª em 31 dias corridos e demais a cada 30 dias
  @Property({ default: false })
  prazoEscalonadoPadrao: boolean = false;
}
