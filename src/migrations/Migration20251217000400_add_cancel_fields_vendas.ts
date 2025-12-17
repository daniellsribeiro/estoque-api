import { Migration } from '@mikro-orm/migrations';

export class Migration20251217000400_add_cancel_fields_vendas extends Migration {
  override async up(): Promise<void> {
    this.addSql('alter table "vendas" add column if not exists "data_cancelamento" timestamptz null;');
    this.addSql('alter table "vendas" add column if not exists "motivo_cancelamento" varchar(255) null;');
  }

  override async down(): Promise<void> {
    this.addSql('alter table "vendas" drop column if exists "data_cancelamento";');
    this.addSql('alter table "vendas" drop column if exists "motivo_cancelamento";');
  }
}
