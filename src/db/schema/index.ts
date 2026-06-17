import { createId } from '@paralleldrive/cuid2';
import { pgTable, varchar, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar('name', { length: 255 }).notNull().unique(),
  password: text('password').notNull()
});

export const session = pgTable('session', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => createId()),
  user_id: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  active_until: timestamp('active_until').notNull()
});

export const service = pgTable('service', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => createId()),
  user_id: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name'),
  url: text('url').notNull(),
  interval_m: integer('interval_m').notNull().default(10),
  last_checked: timestamp('last_checked').notNull().defaultNow(),
  is_okay: boolean('is_okay')
});

export const serviceCheck = pgTable('service_check', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => createId()),
  service_id: varchar('service_id', { length: 255 })
    .notNull()
    .references(() => service.id, { onDelete: 'cascade' }),
  status: integer('status').notNull(),
  latency_ms: integer('latency_ms').notNull(),
  created_at: timestamp('created_at').defaultNow()
});
