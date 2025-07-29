// Comprehensive database of common medications
export interface MedicationInfo {
  name: string;
  genericName?: string;
  brandNames?: string[];
  dosages: string[];
  commonFrequencies: string[];
  category: string;
  requiresFood: boolean;
  emptyStomach: boolean;
  commonSideEffects: string[];
  description: string;
  shape?: string;
  color?: string[];
}

export const medicationDatabase: MedicationInfo[] = [
  // Pain Relief
  {
    name: "Ibuprofen",
    genericName: "Ibuprofen",
    brandNames: ["Advil", "Motrin", "Nuprin"],
    dosages: ["200mg", "400mg", "600mg", "800mg"],
    commonFrequencies: ["every 6-8 hours", "twice daily", "three times daily"],
    category: "Pain Relief/Anti-inflammatory",
    requiresFood: true,
    emptyStomach: false,
    commonSideEffects: ["Stomach upset", "Nausea", "Dizziness"],
    description: "Non-steroidal anti-inflammatory drug (NSAID) for pain and inflammation",
    shape: "round",
    color: ["white", "orange", "brown"]
  },
  {
    name: "Acetaminophen",
    genericName: "Acetaminophen",
    brandNames: ["Tylenol", "Panadol"],
    dosages: ["325mg", "500mg", "650mg"],
    commonFrequencies: ["every 4-6 hours", "three times daily", "four times daily"],
    category: "Pain Relief/Fever Reducer",
    requiresFood: false,
    emptyStomach: true,
    commonSideEffects: ["Rare when used as directed"],
    description: "Pain reliever and fever reducer",
    shape: "round",
    color: ["white", "red"]
  },

  // Blood Pressure
  {
    name: "Lisinopril",
    genericName: "Lisinopril",
    brandNames: ["Prinivil", "Zestril"],
    dosages: ["2.5mg", "5mg", "10mg", "20mg", "40mg"],
    commonFrequencies: ["once daily"],
    category: "Blood Pressure",
    requiresFood: false,
    emptyStomach: true,
    commonSideEffects: ["Dry cough", "Dizziness", "Fatigue"],
    description: "ACE inhibitor for high blood pressure and heart conditions",
    shape: "round",
    color: ["white", "pink", "yellow"]
  },
  {
    name: "Amlodipine",
    genericName: "Amlodipine",
    brandNames: ["Norvasc"],
    dosages: ["2.5mg", "5mg", "10mg"],
    commonFrequencies: ["once daily"],
    category: "Blood Pressure",
    requiresFood: false,
    emptyStomach: true,
    commonSideEffects: ["Swelling", "Dizziness", "Flushing"],
    description: "Calcium channel blocker for high blood pressure",
    shape: "round",
    color: ["white", "blue"]
  },

  // Diabetes
  {
    name: "Metformin",
    genericName: "Metformin",
    brandNames: ["Glucophage", "Fortamet"],
    dosages: ["500mg", "750mg", "850mg", "1000mg"],
    commonFrequencies: ["twice daily", "three times daily"],
    category: "Diabetes",
    requiresFood: true,
    emptyStomach: false,
    commonSideEffects: ["Nausea", "Diarrhea", "Stomach upset"],
    description: "Medication for type 2 diabetes",
    shape: "oval",
    color: ["white"]
  },

  // Cholesterol
  {
    name: "Atorvastatin",
    genericName: "Atorvastatin",
    brandNames: ["Lipitor"],
    dosages: ["10mg", "20mg", "40mg", "80mg"],
    commonFrequencies: ["once daily"],
    category: "Cholesterol",
    requiresFood: false,
    emptyStomach: true,
    commonSideEffects: ["Muscle pain", "Headache", "Nausea"],
    description: "Statin medication to lower cholesterol",
    shape: "oval",
    color: ["white", "blue"]
  },
  {
    name: "Simvastatin",
    genericName: "Simvastatin",
    brandNames: ["Zocor"],
    dosages: ["5mg", "10mg", "20mg", "40mg", "80mg"],
    commonFrequencies: ["once daily in evening"],
    category: "Cholesterol",
    requiresFood: false,
    emptyStomach: true,
    commonSideEffects: ["Muscle pain", "Headache", "Stomach upset"],
    description: "Statin medication to lower cholesterol",
    shape: "round",
    color: ["tan", "pink", "red"]
  },

  // Heart Conditions
  {
    name: "Aspirin",
    genericName: "Aspirin",
    brandNames: ["Bayer", "Bufferin"],
    dosages: ["81mg", "325mg"],
    commonFrequencies: ["once daily"],
    category: "Heart Health/Pain Relief",
    requiresFood: true,
    emptyStomach: false,
    commonSideEffects: ["Stomach irritation", "Bleeding risk"],
    description: "Low-dose for heart protection, higher doses for pain relief",
    shape: "round",
    color: ["white"]
  },

  // Anxiety/Depression
  {
    name: "Sertraline",
    genericName: "Sertraline",
    brandNames: ["Zoloft"],
    dosages: ["25mg", "50mg", "100mg"],
    commonFrequencies: ["once daily"],
    category: "Antidepressant",
    requiresFood: false,
    emptyStomach: true,
    commonSideEffects: ["Nausea", "Dizziness", "Sleep changes"],
    description: "SSRI antidepressant for depression and anxiety",
    shape: "oval",
    color: ["blue", "yellow"]
  },
  {
    name: "Lorazepam",
    genericName: "Lorazepam",
    brandNames: ["Ativan"],
    dosages: ["0.5mg", "1mg", "2mg"],
    commonFrequencies: ["as needed", "twice daily", "three times daily"],
    category: "Anxiety",
    requiresFood: false,
    emptyStomach: true,
    commonSideEffects: ["Drowsiness", "Dizziness", "Confusion"],
    description: "Benzodiazepine for anxiety and panic disorders",
    shape: "round",
    color: ["white"]
  },

  // Thyroid
  {
    name: "Levothyroxine",
    genericName: "Levothyroxine",
    brandNames: ["Synthroid", "Levoxyl"],
    dosages: ["25mcg", "50mcg", "75mcg", "100mcg", "125mcg", "150mcg"],
    commonFrequencies: ["once daily in morning"],
    category: "Thyroid",
    requiresFood: false,
    emptyStomach: true,
    commonSideEffects: ["Heart palpitations", "Nervousness", "Weight loss"],
    description: "Synthetic thyroid hormone replacement",
    shape: "round",
    color: ["orange", "white", "purple", "yellow", "pink"]
  },

  // Antibiotics
  {
    name: "Amoxicillin",
    genericName: "Amoxicillin",
    brandNames: ["Amoxil"],
    dosages: ["250mg", "500mg", "875mg"],
    commonFrequencies: ["twice daily", "three times daily"],
    category: "Antibiotic",
    requiresFood: false,
    emptyStomach: true,
    commonSideEffects: ["Diarrhea", "Nausea", "Rash"],
    description: "Penicillin antibiotic for bacterial infections",
    shape: "capsule",
    color: ["pink", "white"]
  },

  // Acid Reflux
  {
    name: "Omeprazole",
    genericName: "Omeprazole",
    brandNames: ["Prilosec"],
    dosages: ["10mg", "20mg", "40mg"],
    commonFrequencies: ["once daily before breakfast"],
    category: "Acid Reflux",
    requiresFood: false,
    emptyStomach: true,
    commonSideEffects: ["Headache", "Stomach pain", "Diarrhea"],
    description: "Proton pump inhibitor for acid reflux and ulcers",
    shape: "capsule",
    color: ["purple", "pink"]
  },

  // Allergy
  {
    name: "Cetirizine",
    genericName: "Cetirizine",
    brandNames: ["Zyrtec"],
    dosages: ["5mg", "10mg"],
    commonFrequencies: ["once daily"],
    category: "Allergy",
    requiresFood: false,
    emptyStomach: true,
    commonSideEffects: ["Drowsiness", "Dry mouth", "Fatigue"],
    description: "Antihistamine for allergies",
    shape: "round",
    color: ["white"]
  },
  {
    name: "Loratadine",
    genericName: "Loratadine",
    brandNames: ["Claritin"],
    dosages: ["10mg"],
    commonFrequencies: ["once daily"],
    category: "Allergy",
    requiresFood: false,
    emptyStomach: true,
    commonSideEffects: ["Headache", "Fatigue", "Dry mouth"],
    description: "Non-drowsy antihistamine for allergies",
    shape: "round",
    color: ["white"]
  },

  // Sleep
  {
    name: "Zolpidem",
    genericName: "Zolpidem",
    brandNames: ["Ambien"],
    dosages: ["5mg", "10mg"],
    commonFrequencies: ["once daily at bedtime"],
    category: "Sleep Aid",
    requiresFood: false,
    emptyStomach: true,
    commonSideEffects: ["Drowsiness", "Dizziness", "Memory problems"],
    description: "Sleep medication for insomnia",
    shape: "round",
    color: ["white", "pink"]
  }
];

export function searchMedications(query: string): MedicationInfo[] {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return medicationDatabase.slice(0, 10); // Return first 10 if empty

  return medicationDatabase.filter(med => 
    med.name.toLowerCase().includes(searchTerm) ||
    med.genericName?.toLowerCase().includes(searchTerm) ||
    med.brandNames?.some(brand => brand.toLowerCase().includes(searchTerm)) ||
    med.category.toLowerCase().includes(searchTerm)
  ).slice(0, 20); // Limit to 20 results
}

export function getMedicationByName(name: string): MedicationInfo | undefined {
  const searchTerm = name.toLowerCase().trim();
  return medicationDatabase.find(med => 
    med.name.toLowerCase() === searchTerm ||
    med.genericName?.toLowerCase() === searchTerm ||
    med.brandNames?.some(brand => brand.toLowerCase() === searchTerm)
  );
}

export function getMedicationsByCategory(category: string): MedicationInfo[] {
  return medicationDatabase.filter(med => 
    med.category.toLowerCase().includes(category.toLowerCase())
  );
}