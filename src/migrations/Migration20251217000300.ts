import { Migration } from '@mikro-orm/migrations';

export class Migration20251217000300 extends Migration {
  override async up(): Promise<void> {
    this.addSql('alter table "vendas" add column if not exists "data_devolucao" timestamptz null;');
    this.addSql('alter table "vendas" add column if not exists "motivo_devolucao" varchar(255) null;');
  }

  override async down(): Promise<void> {
    this.addSql('alter table "vendas" drop column if exists "data_devolucao";');
    this.addSql('alter table "vendas" drop column if exists "motivo_devolucao";');
  }
}

