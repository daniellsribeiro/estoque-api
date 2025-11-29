import { OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';
import { randomUUID } from 'crypto';

export abstract class BaseHistoryEntity {
  [OptionalProps]?: 'id' | 'createdAt' | 'createdById';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property({ type: Date })
  createdAt: Date = new Date();

  @Property({ nullable: true })
  createdById?: string;
}
