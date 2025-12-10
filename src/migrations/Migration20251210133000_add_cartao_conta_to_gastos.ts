import { Migration } from '@mikro-orm/migrations';

export class Migration20251210133000 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "gastos" add column if not exists "cartao_conta_id" uuid null;');
    this.addSql('alter table "gastos" drop constraint if exists "gastos_cartao_conta_id_foreign";');
    this.addSql(
      'alter table "gastos" add constraint "gastos_cartao_conta_id_foreign" foreign key ("cartao_conta_id") references "cartoes_contas" ("id") on update cascade on delete set null;',
    );
    this.addSql('create index if not exists "gastos_cartao_conta_id_index" on "gastos" ("cartao_conta_id");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "gastos" drop constraint if exists "gastos_cartao_conta_id_foreign";');
    this.addSql('drop index if exists "gastos_cartao_conta_id_index";');
    this.addSql('alter table "gastos" drop column if exists "cartao_conta_id";');
  }
}
