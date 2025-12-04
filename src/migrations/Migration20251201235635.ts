import { Migration } from '@mikro-orm/migrations';

export class Migration20251201235635 extends Migration {
  override async up(): Promise<void> {
    this.addSql('alter table "compras" add column if not exists "cartao_conta_id" uuid null;');
    this.addSql('alter table "compras" drop constraint if exists "compras_cartao_conta_id_foreign";');
    this.addSql('alter table "compras" add constraint "compras_cartao_conta_id_foreign" foreign key ("cartao_conta_id") references "cartoes_contas" ("id") on update cascade on delete set null;');
  }

  override async down(): Promise<void> {
    this.addSql('alter table "compras" drop constraint if exists "compras_cartao_conta_id_foreign";');
    this.addSql('alter table "compras" drop column if exists "cartao_conta_id";');
  }
}
