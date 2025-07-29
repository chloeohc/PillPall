import { 
  type Medication, 
  type InsertMedication,
  type MedicationDose,
  type InsertMedicationDose,
  type Symptom,
  type InsertSymptom,
  type UserSettings,
  type InsertUserSettings,
  medications,
  medicationDoses,
  symptoms,
  userSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Medications
  createMedication(medication: InsertMedication): Promise<Medication>;
  getMedications(): Promise<Medication[]>;
  getMedication(id: string): Promise<Medication | undefined>;
  updateMedication(id: string, medication: Partial<Medication>): Promise<Medication | undefined>;
  deleteMedication(id: string): Promise<boolean>;

  // Medication Doses
  createMedicationDose(dose: InsertMedicationDose): Promise<MedicationDose>;
  getMedicationDoses(date?: string): Promise<MedicationDose[]>;
  getMedicationDose(id: string): Promise<MedicationDose | undefined>;
  updateMedicationDose(id: string, dose: Partial<MedicationDose>): Promise<MedicationDose | undefined>;
  getDosesByMedication(medicationId: string): Promise<MedicationDose[]>;

  // Symptoms
  createSymptom(symptom: InsertSymptom): Promise<Symptom>;
  getSymptoms(date?: string): Promise<Symptom[]>;
  getRecentSymptoms(limit?: number): Promise<Symptom[]>;

  // User Settings
  getUserSettings(): Promise<UserSettings | undefined>;
  updateUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
}

export class MemStorage implements IStorage {
  private medications: Map<string, Medication>;
  private medicationDoses: Map<string, MedicationDose>;
  private symptoms: Map<string, Symptom>;
  private userSettings: UserSettings | undefined;

  constructor() {
    this.medications = new Map();
    this.medicationDoses = new Map();
    this.symptoms = new Map();
    this.userSettings = undefined;
  }

  // Medications
  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const id = randomUUID();
    const medication: Medication = { 
      ...insertMedication, 
      id,
      isActive: true,
      requiresFood: insertMedication.requiresFood ?? false,
      emptyStomach: insertMedication.emptyStomach ?? false,
      foodReminderMinutes: insertMedication.foodReminderMinutes ?? 30
    };
    this.medications.set(id, medication);
    return medication;
  }

  async getMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values()).filter(med => med.isActive);
  }

  async getMedication(id: string): Promise<Medication | undefined> {
    return this.medications.get(id);
  }

  async updateMedication(id: string, medication: Partial<Medication>): Promise<Medication | undefined> {
    const existing = this.medications.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...medication };
    this.medications.set(id, updated);
    return updated;
  }

  async deleteMedication(id: string): Promise<boolean> {
    const existing = this.medications.get(id);
    if (!existing) return false;
    
    const updated = { ...existing, isActive: false };
    this.medications.set(id, updated);
    return true;
  }

  // Medication Doses
  async createMedicationDose(insertDose: InsertMedicationDose): Promise<MedicationDose> {
    const id = randomUUID();
    const dose: MedicationDose = { 
      ...insertDose, 
      id,
      status: insertDose.status ?? "pending",
      takenTime: insertDose.takenTime ?? null
    };
    this.medicationDoses.set(id, dose);
    return dose;
  }

  async getMedicationDoses(date?: string): Promise<MedicationDose[]> {
    const doses = Array.from(this.medicationDoses.values());
    if (date) {
      return doses.filter(dose => dose.date === date);
    }
    return doses;
  }

  async getMedicationDose(id: string): Promise<MedicationDose | undefined> {
    return this.medicationDoses.get(id);
  }

  async updateMedicationDose(id: string, dose: Partial<MedicationDose>): Promise<MedicationDose | undefined> {
    const existing = this.medicationDoses.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...dose };
    this.medicationDoses.set(id, updated);
    return updated;
  }

  async getDosesByMedication(medicationId: string): Promise<MedicationDose[]> {
    return Array.from(this.medicationDoses.values())
      .filter(dose => dose.medicationId === medicationId);
  }

  // Symptoms
  async createSymptom(insertSymptom: InsertSymptom): Promise<Symptom> {
    const id = randomUUID();
    const symptom: Symptom = { 
      ...insertSymptom, 
      id,
      timestamp: new Date()
    };
    this.symptoms.set(id, symptom);
    return symptom;
  }

  async getSymptoms(date?: string): Promise<Symptom[]> {
    const symptoms = Array.from(this.symptoms.values());
    if (date) {
      return symptoms.filter(symptom => symptom.date === date);
    }
    return symptoms.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getRecentSymptoms(limit: number = 5): Promise<Symptom[]> {
    return Array.from(this.symptoms.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // User Settings
  async getUserSettings(): Promise<UserSettings | undefined> {
    return this.userSettings;
  }

  async updateUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const id = this.userSettings?.id || randomUUID();
    this.userSettings = { 
      ...settings, 
      id,
      emergencyContactName: settings.emergencyContactName ?? null,
      emergencyContactPhone: settings.emergencyContactPhone ?? null,
      doctorName: settings.doctorName ?? null,
      doctorPhone: settings.doctorPhone ?? null,
      notificationsEnabled: settings.notificationsEnabled ?? true
    };
    return this.userSettings;
  }
}

export class DatabaseStorage implements IStorage {
  // Medications
  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const [medication] = await db
      .insert(medications)
      .values(insertMedication)
      .returning();
    return medication;
  }

  async getMedications(): Promise<Medication[]> {
    return await db
      .select()
      .from(medications)
      .where(eq(medications.isActive, true));
  }

  async getMedication(id: string): Promise<Medication | undefined> {
    const [medication] = await db
      .select()
      .from(medications)
      .where(eq(medications.id, id));
    return medication || undefined;
  }

  async updateMedication(id: string, medication: Partial<Medication>): Promise<Medication | undefined> {
    const [updated] = await db
      .update(medications)
      .set(medication)
      .where(eq(medications.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteMedication(id: string): Promise<boolean> {
    const [updated] = await db
      .update(medications)
      .set({ isActive: false })
      .where(eq(medications.id, id))
      .returning();
    return !!updated;
  }

  // Medication Doses
  async createMedicationDose(insertDose: InsertMedicationDose): Promise<MedicationDose> {
    const [dose] = await db
      .insert(medicationDoses)
      .values(insertDose)
      .returning();
    return dose;
  }

  async getMedicationDoses(date?: string): Promise<MedicationDose[]> {
    if (date) {
      return await db
        .select()
        .from(medicationDoses)
        .where(eq(medicationDoses.date, date));
    }
    return await db.select().from(medicationDoses);
  }

  async getMedicationDose(id: string): Promise<MedicationDose | undefined> {
    const [dose] = await db
      .select()
      .from(medicationDoses)
      .where(eq(medicationDoses.id, id));
    return dose || undefined;
  }

  async updateMedicationDose(id: string, dose: Partial<MedicationDose>): Promise<MedicationDose | undefined> {
    const [updated] = await db
      .update(medicationDoses)
      .set(dose)
      .where(eq(medicationDoses.id, id))
      .returning();
    return updated || undefined;
  }

  async getDosesByMedication(medicationId: string): Promise<MedicationDose[]> {
    return await db
      .select()
      .from(medicationDoses)
      .where(eq(medicationDoses.medicationId, medicationId));
  }

  // Symptoms
  async createSymptom(insertSymptom: InsertSymptom): Promise<Symptom> {
    const [symptom] = await db
      .insert(symptoms)
      .values(insertSymptom)
      .returning();
    return symptom;
  }

  async getSymptoms(date?: string): Promise<Symptom[]> {
    if (date) {
      return await db
        .select()
        .from(symptoms)
        .where(eq(symptoms.date, date))
        .orderBy(desc(symptoms.timestamp));
    }
    return await db
      .select()
      .from(symptoms)
      .orderBy(desc(symptoms.timestamp));
  }

  async getRecentSymptoms(limit: number = 5): Promise<Symptom[]> {
    return await db
      .select()
      .from(symptoms)
      .orderBy(desc(symptoms.timestamp))
      .limit(limit);
  }

  // User Settings
  async getUserSettings(): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).limit(1);
    return settings || undefined;
  }

  async updateUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    // Try to update existing settings first
    const existing = await this.getUserSettings();
    
    if (existing) {
      const [updated] = await db
        .update(userSettings)
        .set(settings)
        .where(eq(userSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new settings if none exist
      const [created] = await db
        .insert(userSettings)
        .values(settings)
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
