import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Pill, Plus, Info } from "lucide-react";

interface MedicationInfo {
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

interface MedicationSearchProps {
  onSelectMedication: (medication: MedicationInfo) => void;
  onClose?: () => void;
}

export default function MedicationSearch({ onSelectMedication, onClose }: MedicationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search medications
  const { data: searchResults = [], isLoading } = useQuery<MedicationInfo[]>({
    queryKey: ["/api/medication-database/search", debouncedQuery],
    queryFn: async () => {
      const response = await fetch(`/api/medication-database/search?q=${encodeURIComponent(debouncedQuery)}`);
      return response.json();
    },
    enabled: debouncedQuery.length >= 2,
  });

  const handleSelectMedication = (medication: MedicationInfo) => {
    onSelectMedication(medication);
    if (onClose) onClose();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Pain Relief": "bg-red-100 text-red-800",
      "Blood Pressure": "bg-blue-100 text-blue-800",
      "Diabetes": "bg-green-100 text-green-800",
      "Cholesterol": "bg-purple-100 text-purple-800",
      "Heart Health": "bg-pink-100 text-pink-800",
      "Antidepressant": "bg-indigo-100 text-indigo-800",
      "Anxiety": "bg-yellow-100 text-yellow-800",
      "Thyroid": "bg-orange-100 text-orange-800",
      "Antibiotic": "bg-teal-100 text-teal-800",
      "Acid Reflux": "bg-cyan-100 text-cyan-800",
      "Allergy": "bg-lime-100 text-lime-800",
      "Sleep Aid": "bg-violet-100 text-violet-800",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const commonMedicationCategories = [
    "Pain Relief", "Blood Pressure", "Diabetes", "Cholesterol", 
    "Heart Health", "Antidepressant", "Anxiety", "Thyroid"
  ];

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search medications (e.g., Lisinopril, Tylenol, blood pressure...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Categories */}
      {!searchQuery && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Browse by Category</h3>
          <div className="grid grid-cols-2 gap-2">
            {commonMedicationCategories.map(category => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery(category)}
                className="justify-start text-xs"
              >
                <Pill className="w-3 h-3 mr-2" />
                {category}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchQuery && searchQuery.length >= 2 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Search Results {searchResults.length > 0 && `(${searchResults.length})`}
            </h3>
            {isLoading && (
              <div className="text-sm text-gray-500">Searching...</div>
            )}
          </div>

          {searchResults.length === 0 && !isLoading && debouncedQuery.length >= 2 && (
            <div className="text-center py-8 text-gray-500">
              <Pill className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No medications found for "{debouncedQuery}"</p>
              <p className="text-xs mt-1">Try searching for generic names or brand names</p>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto space-y-2">
            {searchResults.map((medication, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{medication.name}</h4>
                        <Badge className={getCategoryColor(medication.category)}>
                          {medication.category}
                        </Badge>
                      </div>
                      
                      {medication.brandNames && medication.brandNames.length > 0 && (
                        <p className="text-xs text-gray-600 mb-1">
                          Also known as: {medication.brandNames.join(", ")}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-700 mb-2">{medication.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {medication.dosages.slice(0, 4).map(dosage => (
                          <span key={dosage} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {dosage}
                          </span>
                        ))}
                        {medication.dosages.length > 4 && (
                          <span className="text-xs text-gray-500">+{medication.dosages.length - 4} more</span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-xs">
                        {medication.requiresFood && (
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">Take with food</span>
                        )}
                        {medication.emptyStomach && (
                          <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded">Empty stomach</span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleSelectMedication(medication)}
                      className="ml-3 bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Info Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Medication Database</p>
            <p className="text-xs">
              This database contains common medications for reference. Always consult your doctor 
              or pharmacist for proper dosing and medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}