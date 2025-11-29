import {
  BeforeCreate,
  OptionalProps,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { randomUUID } from 'crypto';

export abstract class BaseAuditEntity {
  [OptionalProps]?:
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'createdById'
    | 'updatedById';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property({ type: Date })
  createdAt: Date = new Date();

  @Property({ type: Date, onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ nullable: true })
  createdById?: string;

  @Property({ nullable: true })
  updatedById?: string;

  @BeforeCreate()
  setInitialDates() {
    this.updatedAt = this.createdAt;
  }
}
