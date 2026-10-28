import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
export const reservations = sqliteTable('reservations', {
  id: text('id').primaryKey(), room: text('room').notNull(), date: text('date').notNull(), hour: integer('hour').notNull(),
  kind: text('kind').notNull().default('booking'), status: text('status').notNull().default('active'),
  name: text('name').notNull().default(''), studentId: text('student_id').notNull().default(''), className: text('class_name').notNull().default(''),
  phone: text('phone').notNull().default(''), reason: text('reason').notNull().default(''),
  guestHash: text('guest_hash').notNull().default(''), receiptHash: text('receipt_hash'),
  requestId: text('request_id').notNull(), groupId: text('group_id').notNull().default(''), keyStatus: text('key_status').notNull().default('uncollected'),
  createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull(),
}, t => [uniqueIndex('active_room_slot').on(t.room,t.date,t.hour).where(sql`${t.status} = 'active'`),
  uniqueIndex('request_once').on(t.requestId), uniqueIndex('receipt_once').on(t.receiptHash),
  index('guest_records').on(t.guestHash,t.date), index('admin_dates').on(t.date)]);
export const rateLimits = sqliteTable('rate_limits', {
  key:text('key').primaryKey(), count:integer('count').notNull(), expires:integer('expires').notNull()
});
export const siteSettings = sqliteTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
