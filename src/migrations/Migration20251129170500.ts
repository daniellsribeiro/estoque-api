import { Migration } from '@mikro-orm/migrations';

export class Migration20251129170500 extends Migration {

  override async up(): Promise<void> {
    this.addSql('alter table "card_payment_rules" add column if not exists "prazo_escalonado_padrao" boolean not null default false;');

    this.addSql('create table "recebimentos" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "venda_id" uuid null, "tipo_pagamento_id" uuid null, "cartao_conta_id" uuid null, "parcela_numero" int not null, "valor_bruto" numeric(12,2) not null, "valor_taxa" numeric(12,2) not null default 0, "valor_liquido" numeric(12,2) not null, "data_prevista" timestamptz not null, "data_recebida" timestamptz null, "status" varchar(255) not null default \'previsto\', constraint "recebimentos_pkey" primary key ("id"));');
    this.addSql('alter table "recebimentos" add constraint "recebimentos_venda_id_foreign" foreign key ("venda_id") references "vendas" ("id") on update cascade on delete set null;');
    this.addSql('alter table "recebimentos" add constraint "recebimentos_tipo_pagamento_id_foreign" foreign key ("tipo_pagamento_id") references "tipos_pagamento" ("id") on update cascade on delete set null;');
    this.addSql('alter table "recebimentos" add constraint "recebimentos_cartao_conta_id_foreign" foreign key ("cartao_conta_id") references "cartoes_contas" ("id") on update cascade on delete set null;');
    this.addSql('create index "recebimentos_status_index" on "recebimentos" ("status");');
    this.addSql('create index "recebimentos_data_prevista_index" on "recebimentos" ("data_prevista");');
  }

  override async down(): Promise<void> {
    this.addSql('alter table "recebimentos" drop constraint "recebimentos_venda_id_foreign";');
    this.addSql('alter table "recebimentos" drop constraint "recebimentos_tipo_pagamento_id_foreign";');
    this.addSql('alter table "recebimentos" drop constraint "recebimentos_cartao_conta_id_foreign";');
    this.addSql('drop table if exists "recebimentos";');
    this.addSql('alter table "card_payment_rules" drop column if exists "prazo_escalonado_padrao";');
  }

}
