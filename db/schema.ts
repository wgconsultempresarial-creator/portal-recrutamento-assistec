import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const maintenanceReports=sqliteTable('maintenance_reports',{
 id:text('id').primaryKey(), branch:text('branch').notNull(), company:text('company').notNull(), plate:text('plate').notNull(), date:text('date').notNull(), services:text('services').notNull(), signatureMode:text('signature_mode').notNull(), status:text('status').notNull().default('Rascunho'), createdAt:text('created_at').notNull(), createdBy:text('created_by').notNull(), snapshot:text('snapshot'),pdfBase64:text('pdf_base64'),pdfSha256:text('pdf_sha256')
});
export const maintenanceSignatures=sqliteTable('maintenance_signatures',{
 id:text('id').primaryKey(),branch:text('branch').notNull(),image:text('image').notNull(),authorizedBy:text('authorized_by').notNull(),authorizedAt:text('authorized_at').notNull(),revokedBy:text('revoked_by'),revokedAt:text('revoked_at')
});
export const candidates = sqliteTable('candidates', {
 id:text('id').primaryKey(), name:text('name').notNull(), phone:text('phone').notNull(), email:text('email').notNull(), city:text('city').notNull(), role:text('role').notNull(), unit:text('unit').notNull(), experience:text('experience').notNull(), skills:text('skills').notNull(), availability:text('availability').notNull(), status:text('status').notNull().default('Novo'), notes:text('notes').notNull().default(''), createdAt:text('created_at').notNull(), consentAt:text('consent_at').notNull(), updatedBy:text('updated_by'), jobId:text('job_id'), formId:text('form_id'), jobTitle:text('job_title'), answers:text('answers').notNull().default('[]')
});
export const limits=sqliteTable('submission_limits',{key:text('key').primaryKey(),count:integer('count').notNull(), expires:integer('expires').notNull()});

export const forms=sqliteTable('recruitment_forms',{
 id:text('id').primaryKey(), title:text('title').notNull(), description:text('description').notNull(), status:text('status').notNull(), questions:text('questions').notNull(), createdAt:text('created_at').notNull(), updatedAt:text('updated_at').notNull(), updatedBy:text('updated_by').notNull()
});
export const jobs=sqliteTable('jobs',{
 id:text('id').primaryKey(), title:text('title').notNull(), role:text('role').notNull(), unit:text('unit').notNull(), description:text('description').notNull(), requirements:text('requirements').notNull(), contract:text('contract').notNull(), schedule:text('schedule').notNull(), openings:integer('openings').notNull(), closesAt:text('closes_at'), formId:text('form_id').notNull(), status:text('status').notNull(), createdAt:text('created_at').notNull(), updatedAt:text('updated_at').notNull(), updatedBy:text('updated_by').notNull()
});
