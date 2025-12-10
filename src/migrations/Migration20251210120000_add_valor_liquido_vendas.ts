import { Migration } from '@mikro-orm/migrations';

export class Migration20251210120000 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "vendas" add column "valor_liquido" numeric(12,2) not null default 0;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "vendas" drop column "valor_liquido";');
  }
}
