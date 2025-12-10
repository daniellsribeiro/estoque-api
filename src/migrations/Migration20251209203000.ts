import { Migration } from '@mikro-orm/migrations';

export class Migration20251209203000 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "recebimentos" alter column "data_prevista" drop not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "recebimentos" alter column "data_prevista" set not null;');
  }
}
