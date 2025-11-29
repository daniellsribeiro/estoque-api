import { Migration } from '@mikro-orm/migrations';

export class Migration20251128033606 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "cartoes_contas" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "nome" varchar(255) not null, "banco" varchar(255) null, "bandeira" varchar(255) null, "dia_fechamento" int null, "dia_vencimento" int null, "ativo" boolean not null default true, constraint "cartoes_contas_pkey" primary key ("id"));`);

    this.addSql(`create table "cartoes_contas_pagamentos" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "cartao_conta_id" uuid not null, "mes_referencia" varchar(255) not null, "data_pagamento_real" timestamptz not null, constraint "cartoes_contas_pagamentos_pkey" primary key ("id"));`);

    this.addSql(`create table "clientes" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "nome" varchar(255) not null, "telefone" varchar(255) null, "email" varchar(255) null, "observacoes" varchar(255) null, constraint "clientes_pkey" primary key ("id"));`);

    this.addSql(`create table "tipos_pagamento" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "descricao" varchar(255) not null, "taxa_fixa" numeric(12,2) not null default 0, "taxa_percentual" numeric(5,2) not null default 0, "taxa_parcela" numeric(5,2) not null default 0, "desconto_percentual" numeric(5,2) not null default 0, "parcelavel" boolean not null default false, "min_parcelas" int not null default 1, "max_parcelas" int not null default 1, "ativo" boolean not null default true, constraint "tipos_pagamento_pkey" primary key ("id"));`);

    this.addSql(`create table "cores_produto" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "nome" varchar(255) not null, "codigo" varchar(3) not null, constraint "cores_produto_pkey" primary key ("id"));`);
    this.addSql(`alter table "cores_produto" add constraint "cores_produto_codigo_unique" unique ("codigo");`);

    this.addSql(`create table "materiais_produto" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "nome" varchar(255) not null, "codigo" varchar(3) not null, constraint "materiais_produto_pkey" primary key ("id"));`);
    this.addSql(`alter table "materiais_produto" add constraint "materiais_produto_codigo_unique" unique ("codigo");`);

    this.addSql(`create table "tamanhos_produto" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "nome" varchar(255) not null, "codigo" varchar(3) not null, constraint "tamanhos_produto_pkey" primary key ("id"));`);
    this.addSql(`alter table "tamanhos_produto" add constraint "tamanhos_produto_codigo_unique" unique ("codigo");`);

    this.addSql(`create table "tipos_produto" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "nome" varchar(255) not null, "codigo" varchar(2) not null, constraint "tipos_produto_pkey" primary key ("id"));`);
    this.addSql(`alter table "tipos_produto" add constraint "tipos_produto_codigo_unique" unique ("codigo");`);

    this.addSql(`create table "produtos" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "codigo" varchar(255) not null, "nome" varchar(255) not null, "tipo_id" uuid not null, "cor_id" uuid null, "material_id" uuid null, "tamanho_id" uuid null, "categoria" varchar(255) null, "ativo" boolean not null default true, constraint "produtos_pkey" primary key ("id"));`);
    this.addSql(`alter table "produtos" add constraint "produtos_codigo_unique" unique ("codigo");`);

    this.addSql(`create table "estoque_historico" ("id" uuid not null, "created_at" timestamptz not null, "created_by_id" varchar(255) null, "produto_id" uuid not null, "quantidade_anterior" int not null, "quantidade_nova" int not null, "motivo" varchar(255) not null, "referencia" varchar(255) null, constraint "estoque_historico_pkey" primary key ("id"));`);

    this.addSql(`create table "estoque_produtos" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "produto_id" uuid not null, "quantidade_atual" int not null, constraint "estoque_produtos_pkey" primary key ("id"));`);
    this.addSql(`alter table "estoque_produtos" add constraint "estoque_produtos_produto_id_unique" unique ("produto_id");`);

    this.addSql(`create table "precos_produto_historico" ("id" uuid not null, "created_at" timestamptz not null, "created_by_id" varchar(255) null, "produto_id" uuid not null, "preco_antigo" numeric(12,2) not null, "preco_novo" numeric(12,2) not null, "data_inicio" timestamptz not null, "data_fim" timestamptz null, "motivo" varchar(255) not null, constraint "precos_produto_historico_pkey" primary key ("id"));`);

    this.addSql(`create table "precos_produto" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "produto_id" uuid not null, "preco_venda_atual" numeric(12,2) not null, constraint "precos_produto_pkey" primary key ("id"));`);
    this.addSql(`alter table "precos_produto" add constraint "precos_produto_produto_id_unique" unique ("produto_id");`);

    this.addSql(`create table "descontos_produto" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "produto_id" uuid not null, "preco_promocional" numeric(12,2) not null, "data_inicio" timestamptz not null, "data_fim" timestamptz not null, "ativo" boolean not null default true, constraint "descontos_produto_pkey" primary key ("id"));`);

    this.addSql(`create table "vendas" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "data" timestamptz not null, "cliente_id" uuid not null, "tipo_pagamento_id" uuid not null, "parcelas" int not null default 1, "frete" numeric(12,2) not null default 0, "desconto_total" numeric(12,2) not null default 0, "total_venda" numeric(12,2) not null, "status" varchar(255) not null, "observacoes" varchar(255) null, constraint "vendas_pkey" primary key ("id"));`);

    this.addSql(`create table "vendas_itens" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "venda_id" uuid not null, "item_id" uuid not null, "qtde" int not null, "preco_unit" numeric(12,2) not null, "subtotal" numeric(12,2) not null, constraint "vendas_itens_pkey" primary key ("id"));`);

    this.addSql(`create table "estoque_baixas" ("id" uuid not null, "created_at" timestamptz not null, "created_by_id" varchar(255) null, "item_id" uuid not null, "quantidade" int not null, "data" timestamptz not null, "motivo" varchar(255) not null, "venda_id" uuid null, constraint "estoque_baixas_pkey" primary key ("id"));`);

    this.addSql(`create table "fornecedores" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "nome" varchar(255) not null, "endereco" varchar(255) null, "telefone" varchar(255) null, "email" varchar(255) null, "observacoes" varchar(255) null, constraint "fornecedores_pkey" primary key ("id"));`);

    this.addSql(`create table "compras" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "data" timestamptz not null, "fornecedor_id" uuid not null, "tipo_pagamento_id" uuid not null, "parcelas" int not null default 1, "frete" numeric(12,2) not null default 0, "total_compra" numeric(12,2) not null, "status" varchar(255) not null, "observacoes" varchar(255) null, constraint "compras_pkey" primary key ("id"));`);

    this.addSql(`create table "compras_pagamento" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "compra_id" uuid not null, "n_parcela" int not null, "data_vencimento" timestamptz not null, "valor_parcela" numeric(12,2) not null, "status_pagamento" varchar(255) not null, "data_pagamento" timestamptz null, "tipo_pagamento_id" uuid not null, "cartao_conta_id" uuid null, "observacoes" varchar(255) null, constraint "compras_pagamento_pkey" primary key ("id"));`);

    this.addSql(`create table "compras_itens" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "compra_id" uuid not null, "item_id" uuid not null, "qtde" int not null, "valor_unit" numeric(12,2) not null, "valor_total" numeric(12,2) not null, constraint "compras_itens_pkey" primary key ("id"));`);

    this.addSql(`create table "gastos" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "data" timestamptz not null, "fornecedor_id" uuid null, "tipo_pagamento_id" uuid not null, "parcelas" int not null default 1, "total_gasto" numeric(12,2) not null, "status" varchar(255) not null, "observacoes" varchar(255) null, constraint "gastos_pkey" primary key ("id"));`);

    this.addSql(`create table "gastos_pagamento" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "gasto_id" uuid not null, "n_parcela" int not null, "data_vencimento" timestamptz not null, "valor_parcela" numeric(12,2) not null, "status_pagamento" varchar(255) not null, "data_pagamento" timestamptz null, "tipo_pagamento_id" uuid not null, "cartao_conta_id" uuid null, "observacoes" varchar(255) null, constraint "gastos_pagamento_pkey" primary key ("id"));`);

    this.addSql(`create table "gastos_itens" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "gasto_id" uuid not null, "descricao_item" varchar(255) not null, "qtde" int not null, "valor_unit" numeric(12,2) not null, "valor_total" numeric(12,2) not null, constraint "gastos_itens_pkey" primary key ("id"));`);

    this.addSql(`create table "users" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" varchar(255) null, "updated_by_id" varchar(255) null, "name" varchar(255) not null, "email" varchar(255) not null, "password_hash" varchar(255) not null, "active" boolean not null default true, constraint "users_pkey" primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);

    this.addSql(`alter table "cartoes_contas_pagamentos" add constraint "cartoes_contas_pagamentos_cartao_conta_id_foreign" foreign key ("cartao_conta_id") references "cartoes_contas" ("id") on update cascade;`);

    this.addSql(`alter table "produtos" add constraint "produtos_tipo_id_foreign" foreign key ("tipo_id") references "tipos_produto" ("id") on update cascade;`);
    this.addSql(`alter table "produtos" add constraint "produtos_cor_id_foreign" foreign key ("cor_id") references "cores_produto" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "produtos" add constraint "produtos_material_id_foreign" foreign key ("material_id") references "materiais_produto" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "produtos" add constraint "produtos_tamanho_id_foreign" foreign key ("tamanho_id") references "tamanhos_produto" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "estoque_historico" add constraint "estoque_historico_produto_id_foreign" foreign key ("produto_id") references "produtos" ("id") on update cascade;`);

    this.addSql(`alter table "estoque_produtos" add constraint "estoque_produtos_produto_id_foreign" foreign key ("produto_id") references "produtos" ("id") on update cascade;`);

    this.addSql(`alter table "precos_produto_historico" add constraint "precos_produto_historico_produto_id_foreign" foreign key ("produto_id") references "produtos" ("id") on update cascade;`);

    this.addSql(`alter table "precos_produto" add constraint "precos_produto_produto_id_foreign" foreign key ("produto_id") references "produtos" ("id") on update cascade;`);

    this.addSql(`alter table "descontos_produto" add constraint "descontos_produto_produto_id_foreign" foreign key ("produto_id") references "produtos" ("id") on update cascade;`);

    this.addSql(`alter table "vendas" add constraint "vendas_cliente_id_foreign" foreign key ("cliente_id") references "clientes" ("id") on update cascade;`);
    this.addSql(`alter table "vendas" add constraint "vendas_tipo_pagamento_id_foreign" foreign key ("tipo_pagamento_id") references "tipos_pagamento" ("id") on update cascade;`);

    this.addSql(`alter table "vendas_itens" add constraint "vendas_itens_venda_id_foreign" foreign key ("venda_id") references "vendas" ("id") on update cascade;`);
    this.addSql(`alter table "vendas_itens" add constraint "vendas_itens_item_id_foreign" foreign key ("item_id") references "produtos" ("id") on update cascade;`);

    this.addSql(`alter table "estoque_baixas" add constraint "estoque_baixas_item_id_foreign" foreign key ("item_id") references "produtos" ("id") on update cascade;`);
    this.addSql(`alter table "estoque_baixas" add constraint "estoque_baixas_venda_id_foreign" foreign key ("venda_id") references "vendas" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "compras" add constraint "compras_fornecedor_id_foreign" foreign key ("fornecedor_id") references "fornecedores" ("id") on update cascade;`);
    this.addSql(`alter table "compras" add constraint "compras_tipo_pagamento_id_foreign" foreign key ("tipo_pagamento_id") references "tipos_pagamento" ("id") on update cascade;`);

    this.addSql(`alter table "compras_pagamento" add constraint "compras_pagamento_compra_id_foreign" foreign key ("compra_id") references "compras" ("id") on update cascade;`);
    this.addSql(`alter table "compras_pagamento" add constraint "compras_pagamento_tipo_pagamento_id_foreign" foreign key ("tipo_pagamento_id") references "tipos_pagamento" ("id") on update cascade;`);
    this.addSql(`alter table "compras_pagamento" add constraint "compras_pagamento_cartao_conta_id_foreign" foreign key ("cartao_conta_id") references "cartoes_contas" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "compras_itens" add constraint "compras_itens_compra_id_foreign" foreign key ("compra_id") references "compras" ("id") on update cascade;`);
    this.addSql(`alter table "compras_itens" add constraint "compras_itens_item_id_foreign" foreign key ("item_id") references "produtos" ("id") on update cascade;`);

    this.addSql(`alter table "gastos" add constraint "gastos_fornecedor_id_foreign" foreign key ("fornecedor_id") references "fornecedores" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "gastos" add constraint "gastos_tipo_pagamento_id_foreign" foreign key ("tipo_pagamento_id") references "tipos_pagamento" ("id") on update cascade;`);

    this.addSql(`alter table "gastos_pagamento" add constraint "gastos_pagamento_gasto_id_foreign" foreign key ("gasto_id") references "gastos" ("id") on update cascade;`);
    this.addSql(`alter table "gastos_pagamento" add constraint "gastos_pagamento_tipo_pagamento_id_foreign" foreign key ("tipo_pagamento_id") references "tipos_pagamento" ("id") on update cascade;`);
    this.addSql(`alter table "gastos_pagamento" add constraint "gastos_pagamento_cartao_conta_id_foreign" foreign key ("cartao_conta_id") references "cartoes_contas" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "gastos_itens" add constraint "gastos_itens_gasto_id_foreign" foreign key ("gasto_id") references "gastos" ("id") on update cascade;`);
  }

}
