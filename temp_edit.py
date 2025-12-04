from pathlib import Path
p=Path("src/migrations/Migration20251130130452.ts")
text=p.read_text(encoding="utf-8")
old="""    this.addSql(`create table "tipos_pagamento" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "descricao" varchar(255) not null, "ativo" boolean not null default true, constraint "tipos_pagamento_pkey" primary key ("id"));`);
    this.addSql(`insert into "tipos_pagamento" ("id", "created_at", "updated_at", "created_by_id", "updated_by_id", "descricao", "ativo")
                 values
                 ('11111111-1111-1111-1111-111111111111', now(), now(), null, null, 'Pix', true),
                 ('22222222-2222-2222-2222-222222222222', now(), now(), null, null, 'Dinheiro', true),
                 ('33333333-3333-3333-3333-333333333333', now(), now(), null, null, 'CrǸdito', true),
                 ('44444444-4444-4444-4444-444444444444', now(), now(), null, null, 'DǸbito', true)
                 on conflict (id) do nothing;`);
"""
new="""    this.addSql(`create table \"tipos_pagamento\" (\"id\" uuid not null, \"created_at\" timestamptz not null, \"updated_at\" timestamptz not null, \"created_by_id\" varchar(255) null, \"updated_by_id\" varchar(255) null, \"descricao\" varchar(255) not null, \"ativo\" boolean not null default true, constraint \"tipos_pagamento_pkey\" primary key (\"id\"));`);
    this.addSql(`alter table \"tipos_pagamento\" alter column \"id\" set default gen_random_uuid();`);
    this.addSql(`alter table \"tipos_pagamento\" add constraint \"tipos_pagamento_descricao_unique\" unique (\"descricao\");`);
    this.addSql(`insert into \"tipos_pagamento\" (\"id\", \"created_at\", \"updated_at\", \"created_by_id\", \"updated_by_id\", \"descricao\", \"ativo\")
                 select gen_random_uuid(), now(), now(), null, null, 'Pix', true
                 where not exists (select 1 from \"tipos_pagamento\" where lower(\"descricao\") = 'pix');`);
    this.addSql(`insert into \"tipos_pagamento\" (\"id\", \"created_at\", \"updated_at\", \"created_by_id\", \"updated_by_id\", \"descricao\", \"ativo\")
                 select gen_random_uuid(), now(), now(), null, null, 'Dinheiro', true
                 where not exists (select 1 from \"tipos_pagamento\" where lower(\"descricao\") = 'dinheiro');`);
    this.addSql(`insert into \"tipos_pagamento\" (\"id\", \"created_at\", \"updated_at\", \"created_by_id\", \"updated_by_id\", \"descricao\", \"ativo\")
                 select gen_random_uuid(), now(), now(), null, null, 'Crédito', true
                 where not exists (select 1 from \"tipos_pagamento\" where lower(\"descricao\") = 'crédito');`);
    this.addSql(`insert into \"tipos_pagamento\" (\"id\", \"created_at\", \"updated_at\", \"created_by_id\", \"updated_by_id\", \"descricao\", \"ativo\")
                 select gen_random_uuid(), now(), now(), null, null, 'Débito', true
                 where not exists (select 1 from \"tipos_pagamento\" where lower(\"descricao\") = 'débito');`);
"""
if old not in text:
    raise SystemExit('pattern not found')
p.write_text(text.replace(old,new),encoding='utf-8')
