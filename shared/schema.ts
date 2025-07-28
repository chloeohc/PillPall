import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const medications = pgTable("medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  times: text("times").array().notNull(), // Array of time strings like ["08:00", "20:00"]
  requiresFood: boolean("requires_food").default(false),
  emptyStomach: boolean("empty_stomach").default(false),
  foodReminderMinutes: integer("food_reminder_minutes").default(30), // Minutes before dose to remind about food
  isActive: boolean("is_active").default(true),
});

export const medicationDoses = pgTable("medication_doses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  medicationId: varchar("medication_id").notNull().references(() => medications.id),
  scheduledTime: timestamp("scheduled_time").notNull(),
  takenTime: timestamp("taken_time"),
  status: text("status").notNull().default("pending"), // pending, taken, missed, late
  date: text("date").notNull(), // YYYY-MM-DD format
});

export const symptoms = pgTable("symptoms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  severity: integer("severity").notNull(), // 1-5 scale
  timestamp: timestamp("timestamp").notNull().default(sql`CURRENT_TIMESTAMP`),
  date: text("date").notNull(), // YYYY-MM-DD format
});

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  doctorName: text("doctor_name"),
  doctorPhone: text("doctor_phone"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  isActive: true,
});

export const insertMedicationDoseSchema = createInsertSchema(medicationDoses).omit({
  id: true,
});

export const insertSymptomSchema = createInsertSchema(symptoms).omit({
  id: true,
  timestamp: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
});

export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;
export type InsertMedicationDose = z.infer<typeof insertMedicationDoseSchema>;
export type MedicationDose = typeof medicationDoses.$inferSelect;
export type InsertSymptom = z.infer<typeof insertSymptomSchema>;
export type Symptom = typeof symptoms.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
