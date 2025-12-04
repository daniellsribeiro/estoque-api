import { Migration } from '@mikro-orm/migrations';

export class Migration20251202114010 extends Migration {
  override async up(): Promise<void> {
    this.addSql('alter table "compras_pagamento" add column if not exists "valor_compra" numeric(12,2) null;');
    this.addSql('update "compras_pagamento" set "valor_compra" = coalesce("valor_compra", "valor_parcela");');
    this.addSql('alter table "compras_pagamento" alter column "valor_compra" set not null;');
    this.addSql('alter table "compras_pagamento" add column if not exists "cartao_conta_id" uuid null;');
    this.addSql('alter table "compras_pagamento" drop constraint if exists "compras_pagamento_cartao_conta_id_foreign";');
    this.addSql('alter table "compras_pagamento" add constraint "compras_pagamento_cartao_conta_id_foreign" foreign key ("cartao_conta_id") references "cartoes_contas" ("id") on update cascade on delete set null;');
  }

  override async down(): Promise<void> {
    this.addSql('alter table "compras_pagamento" drop constraint if exists "compras_pagamento_cartao_conta_id_foreign";');
    this.addSql('alter table "compras_pagamento" drop column if exists "cartao_conta_id";');
    this.addSql('alter table "compras_pagamento" drop column if exists "valor_compra";');
  }
}
