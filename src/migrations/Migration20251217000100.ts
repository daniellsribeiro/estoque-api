import { Migration } from '@mikro-orm/migrations';

export class Migration20251217000100 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "preferences" (
        "id" uuid not null default gen_random_uuid(),
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "created_by_id" uuid null,
        "updated_by_id" uuid null,
        "alerta_estoque" integer not null default 0,
        constraint "preferences_pkey" primary key ("id")
      );
    `);

    this.addSql(`
      insert into "preferences" ("id", "created_at", "updated_at", "created_by_id", "updated_by_id", "alerta_estoque")
      select gen_random_uuid(), now(), now(), null, null, 0
      where not exists (select 1 from "preferences");
    `);
  }

  override async down(): Promise<void> {
    this.addSql('drop table if exists "preferences";');
  }
}

