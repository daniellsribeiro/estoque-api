import { Migration } from '@mikro-orm/migrations';

export class Migration20251129160000 extends Migration {

  override async up(): Promise<void> {
    this.addSql('alter table "cartoes_contas" add column if not exists "pix_chave" varchar(255);');

    this.addSql('create table "card_payment_rules" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "cartao_id" uuid not null, "tipo" varchar(50) not null, "taxa_percentual" numeric(12,4) not null default 0, "taxa_fixa" numeric(12,4) not null default 0, "adicional_parcela" numeric(12,4) not null default 0, "prazo_recebimento_dias" int not null default 0, constraint "card_payment_rules_pkey" primary key ("id"));');
    this.addSql('create index "card_payment_rules_cartao_id_index" on "card_payment_rules" ("cartao_id");');
    this.addSql('alter table "card_payment_rules" add constraint "card_payment_rules_cartao_id_foreign" foreign key ("cartao_id") references "cartoes_contas" ("id") on update cascade on delete cascade;');
  }

  override async down(): Promise<void> {
    this.addSql('alter table "card_payment_rules" drop constraint "card_payment_rules_cartao_id_foreign";');
    this.addSql('drop table if exists "card_payment_rules";');
    this.addSql('alter table "cartoes_contas" drop column if exists "pix_chave";');
  }

}
