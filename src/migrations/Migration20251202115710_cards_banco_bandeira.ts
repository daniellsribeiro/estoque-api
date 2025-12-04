import { Migration } from '@mikro-orm/migrations';

export class Migration20251202115710_cards_banco_bandeira extends Migration {
  override async up(): Promise<void> {
    this.addSql('alter table "cartoes_contas" add column if not exists "banco" varchar(255) null;');
    this.addSql('alter table "cartoes_contas" add column if not exists "bandeira" varchar(255) null;');
  }

  override async down(): Promise<void> {
    this.addSql('alter table "cartoes_contas" drop column if exists "banco";');
    this.addSql('alter table "cartoes_contas" drop column if exists "bandeira";');
  }
}
