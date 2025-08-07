import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertMedicationSchema, 
  insertMedicationDoseSchema,
  insertSymptomSchema,
  insertUserSettingsSchema
} from "@shared/schema";
import { searchMedications, getMedicationByName, getMedicationsByCategory } from "./medication-database";

export async function registerRoutes(app: Express): Promise<Server> {
  // Medications
  app.get("/api/medications", async (req, res) => {
    try {
      const medications = await storage.getMedications();
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });

  app.post("/api/medications", async (req, res) => {
    try {
      const validatedData = insertMedicationSchema.parse(req.body);
      const medication = await storage.createMedication(validatedData);
      res.status(201).json(medication);
    } catch (error) {
      res.status(400).json({ message: "Invalid medication data" });
    }
  });

  app.get("/api/medications/:id", async (req, res) => {
    try {
      const medication = await storage.getMedication(req.params.id);
      if (!medication) {
        res.status(404).json({ message: "Medication not found" });
        return;
      }
      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medication" });
    }
  });

  app.put("/api/medications/:id", async (req, res) => {
    try {
      const medication = await storage.updateMedication(req.params.id, req.body);
      if (!medication) {
        res.status(404).json({ message: "Medication not found" });
        return;
      }
      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: "Failed to update medication" });
    }
  });

  app.delete("/api/medications/:id", async (req, res) => {
    try {
      const success = await storage.deleteMedication(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Medication not found" });
        return;
      }
      res.json({ message: "Medication deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete medication" });
    }
  });

  // Medication Doses
  app.get("/api/doses", async (req, res) => {
    try {
      const date = req.query.date as string;
      const doses = await storage.getMedicationDoses(date);
      res.json(doses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch doses" });
    }
  });

  app.post("/api/doses", async (req, res) => {
    try {
      const validatedData = insertMedicationDoseSchema.parse(req.body);
      const dose = await storage.createMedicationDose(validatedData);
      res.status(201).json(dose);
    } catch (error) {
      res.status(400).json({ message: "Invalid dose data" });
    }
  });

  app.put("/api/doses/:id", async (req, res) => {
    try {
      console.log('Updating dose:', req.params.id, 'with data:', req.body);
      
      // Convert ISO string timestamps to Date objects for Drizzle
      const updateData = { ...req.body };
      if (updateData.takenTime && typeof updateData.takenTime === 'string') {
        updateData.takenTime = new Date(updateData.takenTime);
      }
      if (updateData.scheduledTime && typeof updateData.scheduledTime === 'string') {
        updateData.scheduledTime = new Date(updateData.scheduledTime);
      }
      
      const dose = await storage.updateMedicationDose(req.params.id, updateData);
      if (!dose) {
        res.status(404).json({ message: "Dose not found" });
        return;
      }
      res.json(dose);
    } catch (error: any) {
      console.error('Error updating dose:', error);
      res.status(500).json({ message: "Failed to update dose", error: error?.message || 'Unknown error' });
    }
  });

  // Symptoms
  app.get("/api/symptoms", async (req, res) => {
    try {
      const date = req.query.date as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      let symptoms;
      if (req.query.recent === 'true') {
        symptoms = await storage.getRecentSymptoms(limit);
      } else {
        symptoms = await storage.getSymptoms(date);
      }
      
      res.json(symptoms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch symptoms" });
    }
  });

  app.post("/api/symptoms", async (req, res) => {
    try {
      const validatedData = insertSymptomSchema.parse(req.body);
      const symptom = await storage.createSymptom(validatedData);
      res.status(201).json(symptom);
    } catch (error) {
      res.status(400).json({ message: "Invalid symptom data" });
    }
  });

  // User Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getUserSettings();
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const validatedData = insertUserSettingsSchema.parse(req.body);
      const settings = await storage.updateUserSettings(validatedData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid settings data" });
    }
  });

  // Generate today's schedule
  app.post("/api/generate-schedule", async (req, res) => {
    try {
      const { date } = req.body;
      const medications = await storage.getMedications();
      const existingDoses = await storage.getMedicationDoses(date);
      
      const newDoses = [];
      
      for (const medication of medications) {
        for (const time of medication.times) {
          // Check if dose already exists for this medication and time today
          const existing = existingDoses.find(dose => 
            dose.medicationId === medication.id && 
            dose.scheduledTime.toTimeString().slice(0, 5) === time
          );
          
          if (!existing) {
            const [hours, minutes] = time.split(':');
            const scheduledTime = new Date();
            scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            const dose = await storage.createMedicationDose({
              medicationId: medication.id,
              scheduledTime,
              date,
              status: "pending"
            });
            newDoses.push(dose);
          }
        }
      }
      
      res.json({ message: "Schedule generated", dosesCreated: newDoses.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate schedule" });
    }
  });

  // Medication Database Search
  app.get("/api/medication-database/search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const results = searchMedications(query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to search medications" });
    }
  });

  app.get("/api/medication-database/:name", async (req, res) => {
    try {
      const medication = getMedicationByName(req.params.name);
      if (!medication) {
        res.status(404).json({ message: "Medication not found" });
        return;
      }
      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medication" });
    }
  });

  app.get("/api/medication-database/category/:category", async (req, res) => {
    try {
      const medications = getMedicationsByCategory(req.params.category);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medications by category" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
