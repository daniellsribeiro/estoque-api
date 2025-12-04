import { Migration } from '@mikro-orm/migrations';

// Ajuste de UUIDs e seeds corretos para tipos_pagamento sem afetar outras tabelas
export class Migration20251201001500 extends Migration {
  override async up(): Promise<void> {
    // IDs v4 válidos e estáveis para cada meio
    const pix = '8f23fa4c-7f4c-4f2b-8c4e-8a9cbfdbe111';
    const dinheiro = '6d3b0e23-95b4-4c2f-9e1c-6c6a4db1e222';
    const credito = 'a92f3e56-6f7b-4a3c-8d8c-57a7c4c5f333';
    const debito = 'c0f7b4d1-1a2b-4c5d-8e9f-aaaabbbb4444';

    // Garante default e unicidade (via índice)
    this.addSql(`alter table "tipos_pagamento" alter column "id" set default gen_random_uuid();`);
    this.addSql(`create unique index if not exists "tipos_pagamento_descricao_unique_idx" on "tipos_pagamento"(lower("descricao"));`);

    // Corrige/atualiza IDs existentes
    this.addSql(`update "tipos_pagamento" set id = '${pix}' where lower("descricao") = 'pix';`);
    this.addSql(`update "tipos_pagamento" set id = '${dinheiro}' where lower("descricao") = 'dinheiro';`);
    this.addSql(`update "tipos_pagamento" set id = '${credito}' where lower("descricao") in ('credito','crédito');`);
    this.addSql(`update "tipos_pagamento" set id = '${debito}' where lower("descricao") in ('debito','débito');`);

    // Reinsere caso algum não exista
    this.addSql(`insert into "tipos_pagamento" ("id","created_at","updated_at","created_by_id","updated_by_id","descricao","ativo")
                 select '${pix}', now(), now(), null, null, 'Pix', true
                 where not exists (select 1 from "tipos_pagamento" where id='${pix}');`);
    this.addSql(`insert into "tipos_pagamento" ("id","created_at","updated_at","created_by_id","updated_by_id","descricao","ativo")
                 select '${dinheiro}', now(), now(), null, null, 'Dinheiro', true
                 where not exists (select 1 from "tipos_pagamento" where id='${dinheiro}');`);
    this.addSql(`insert into "tipos_pagamento" ("id","created_at","updated_at","created_by_id","updated_by_id","descricao","ativo")
                 select '${credito}', now(), now(), null, null, 'Credito', true
                 where not exists (select 1 from "tipos_pagamento" where id='${credito}');`);
    this.addSql(`insert into "tipos_pagamento" ("id","created_at","updated_at","created_by_id","updated_by_id","descricao","ativo")
                 select '${debito}', now(), now(), null, null, 'Debito', true
                 where not exists (select 1 from "tipos_pagamento" where id='${debito}');`);
  }

  override async down(): Promise<void> {
    const ids = [
      '8f23fa4c-7f4c-4f2b-8c4e-8a9cbfdbe111',
      '6d3b0e23-95b4-4c2f-9e1c-6c6a4db1e222',
      'a92f3e56-6f7b-4a3c-8d8c-57a7c4c5f333',
      'c0f7b4d1-1a2b-4c5d-8e9f-aaaabbbb4444',
    ];
    this.addSql(`delete from "tipos_pagamento" where id in (${ids.map((id) => `'${id}'`).join(',')});`);
    this.addSql(`drop index if exists "tipos_pagamento_descricao_unique_idx";`);
    this.addSql(`alter table "tipos_pagamento" alter column "id" drop default;`);
  }
}
