import { Migration } from '@mikro-orm/migrations';

export class Migration20251203014822_stock_history_fields extends Migration {
  override async up(): Promise<void> {
    this.addSql('alter table "estoque_historico" add column "quantidade_adicionada" numeric(12,2) not null default 0;');
    this.addSql('alter table "estoque_historico" add column "quantidade_subtraida" numeric(12,2) not null default 0;');
    this.addSql('alter table "estoque_historico" add column "id_compra" uuid null;');
    this.addSql('alter table "estoque_historico" add column "id_venda" uuid null;');
    this.addSql('alter table "estoque_historico" add column "data_mudanca" timestamptz not null default now();');
  }

  override async down(): Promise<void> {
    this.addSql('alter table "estoque_historico" drop column "data_mudanca";');
    this.addSql('alter table "estoque_historico" drop column "id_venda";');
    this.addSql('alter table "estoque_historico" drop column "id_compra";');
    this.addSql('alter table "estoque_historico" drop column "quantidade_subtraida";');
    this.addSql('alter table "estoque_historico" drop column "quantidade_adicionada";');
  }
}
