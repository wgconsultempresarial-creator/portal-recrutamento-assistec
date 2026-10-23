import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const candidates = sqliteTable('candidates', {
 id:text('id').primaryKey(), name:text('name').notNull(), phone:text('phone').notNull(), email:text('email').notNull(), city:text('city').notNull(), role:text('role').notNull(), unit:text('unit').notNull(), experience:text('experience').notNull(), skills:text('skills').notNull(), availability:text('availability').notNull(), status:text('status').notNull().default('Novo'), notes:text('notes').notNull().default(''), createdAt:text('created_at').notNull(), consentAt:text('consent_at').notNull(), updatedBy:text('updated_by')
});
export const limits=sqliteTable('submission_limits',{key:text('key').primaryKey(),count:integer('count').notNull(), expires:integer('expires').notNull()});
