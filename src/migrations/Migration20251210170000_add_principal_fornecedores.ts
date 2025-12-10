import { Migration } from '@mikro-orm/migrations';

export class Migration20251210170000 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "fornecedores" add column if not exists "principal" boolean not null default true;');
    this.addSql('update "fornecedores" set "principal" = true where "principal" is null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "fornecedores" drop column if exists "principal";');
  }
}
