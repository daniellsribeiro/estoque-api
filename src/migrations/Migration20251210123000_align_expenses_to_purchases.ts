import { Migration } from '@mikro-orm/migrations';

export class Migration20251210123000 extends Migration {
  async up(): Promise<void> {
    // gastos: renomeia total_gasto -> total_compra
    this.addSql('alter table "gastos" rename column "total_gasto" to "total_compra";');

    // compras: garante cartao_conta_id com FK
    this.addSql('alter table "compras" add column if not exists "cartao_conta_id" uuid null;');
    this.addSql('alter table "compras" drop constraint if exists "compras_cartao_conta_id_foreign";');
    this.addSql(
      'alter table "compras" add constraint "compras_cartao_conta_id_foreign" foreign key ("cartao_conta_id") references "cartoes_contas" ("id") on update cascade on delete set null;',
    );

    // gasto_pagamentos: adiciona valor_compra
    this.addSql('alter table "gastos_pagamento" add column if not exists "valor_compra" numeric(12,2) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "gastos_pagamento" drop column if exists "valor_compra";');

    this.addSql('alter table "compras" drop constraint if exists "compras_cartao_conta_id_foreign";');
    this.addSql('alter table "compras" drop column if exists "cartao_conta_id";');

    this.addSql('alter table "gastos" rename column "total_compra" to "total_gasto";');
  }
}
