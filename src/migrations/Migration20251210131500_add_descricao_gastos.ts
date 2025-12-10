import { Migration } from '@mikro-orm/migrations';

export class Migration20251210131500 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "gastos" add column if not exists "descricao" varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "gastos" drop column if exists "descricao";');
  }
}
