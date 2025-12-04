import { Migration } from '@mikro-orm/migrations';

export class Migration20251201231249 extends Migration {
  override async up(): Promise<void> {
    this.addSql('alter table "compras_pagamento" alter column "data_vencimento" drop not null;');
  }

  override async down(): Promise<void> {
    this.addSql('update "compras_pagamento" set "data_vencimento" = coalesce("data_vencimento", now());');
    this.addSql('alter table "compras_pagamento" alter column "data_vencimento" set not null;');
  }
}
