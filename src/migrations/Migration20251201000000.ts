import { Migration } from '@mikro-orm/migrations';

export class Migration20251201000000 extends Migration {
  override async up(): Promise<void> {
    // Tipos de pagamento: garantir UUID válido e seeds corretos
    this.addSql(`alter table "tipos_pagamento" alter column "id" set default gen_random_uuid();`);
    // Usa índice único (case-insensitive) em vez de constraint para compatibilidade
    this.addSql(`create unique index if not exists "tipos_pagamento_descricao_unique_idx" on "tipos_pagamento"(lower("descricao"));`);

    this.addSql(`insert into "tipos_pagamento" ("id", "created_at", "updated_at", "created_by_id", "updated_by_id", "descricao", "ativo")
                 select gen_random_uuid(), now(), now(), null, null, 'Pix', true
                 where not exists (select 1 from "tipos_pagamento" where lower("descricao") = 'pix');`);
    this.addSql(`insert into "tipos_pagamento" ("id", "created_at", "updated_at", "created_by_id", "updated_by_id", "descricao", "ativo")
                 select gen_random_uuid(), now(), now(), null, null, 'Dinheiro', true
                 where not exists (select 1 from "tipos_pagamento" where lower("descricao") = 'dinheiro');`);
    this.addSql(`insert into "tipos_pagamento" ("id", "created_at", "updated_at", "created_by_id", "updated_by_id", "descricao", "ativo")
                 select gen_random_uuid(), now(), now(), null, null, 'Credito', true
                 where not exists (select 1 from "tipos_pagamento" where lower("descricao") in ('credito','crédito'));`);
    this.addSql(`insert into "tipos_pagamento" ("id", "created_at", "updated_at", "created_by_id", "updated_by_id", "descricao", "ativo")
                 select gen_random_uuid(), now(), now(), null, null, 'Debito', true
                 where not exists (select 1 from "tipos_pagamento" where lower("descricao") in ('debito','débito'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "tipos_pagamento_descricao_unique_idx";`);
    this.addSql(`alter table "tipos_pagamento" alter column "id" drop default;`);
    this.addSql(`delete from "tipos_pagamento" where lower("descricao") in ('pix','dinheiro','credito','crédito','debito','débito');`);
  }
}
