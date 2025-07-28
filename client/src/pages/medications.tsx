import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Pill, Clock, UtensilsCrossed, Zap } from "lucide-react";
import { format } from "date-fns";
import AddMedicationModal from "@/components/add-medication-modal";
import CameraModal from "@/components/camera-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Medications() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch medications
  const { data: medications = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/medications"],
  });

  // Delete medication mutation
  const deleteMedicationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/medications/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      toast({
        title: "Success",
        description: "Medication deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete medication",
        variant: "destructive",
      });
    },
  });

  const handleDeleteMedication = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMedicationMutation.mutate(id);
    }
  };

  const formatTimes = (times: string[]) => {
    return times.map(time => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }).join(', ');
  };

  const getFrequencyDisplay = (frequency: string) => {
    switch (frequency) {
      case "once_daily": return "Once daily";
      case "twice_daily": return "Twice daily";
      case "three_times_daily": return "Three times daily";
      case "four_times_daily": return "Four times daily";
      case "as_needed": return "As needed";
      default: return frequency;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Pill className="text-white w-4 h-4" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">My Medications</h1>
            </div>
            <Button 
              onClick={() => setShowAddModal(true)}
              size="icon"
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {medications.length === 0 ? (
          <div className="text-center py-12">
            <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medications yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first medication</p>
            <div className="space-y-3">
              <Button 
                onClick={() => setShowAddModal(true)}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
              <Button 
                onClick={() => setShowCameraModal(true)}
                variant="outline"
                className="w-full"
              >
                <Pill className="w-4 h-4 mr-2" />
                Scan Pill
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map((medication: any) => (
              <Card key={medication.id} className="shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-medium text-gray-900">
                        {medication.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{medication.dosage}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMedication(medication.id, medication.name)}
                        className="w-8 h-8 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {getFrequencyDisplay(medication.frequency)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formatTimes(medication.times)}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {medication.requiresFood && (
                      <Badge variant="outline" className="text-xs">
                        <UtensilsCrossed className="w-3 h-3 mr-1" />
                        Take with food
                      </Badge>
                    )}
                    {medication.emptyStomach && (
                      <Badge variant="outline" className="text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        Empty stomach
                      </Badge>
                    )}
                    {medication.requiresFood && medication.foodReminderMinutes && (
                      <Badge variant="secondary" className="text-xs">
                        Food reminder: {medication.foodReminderMinutes}min before
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <AddMedicationModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
        onOpenCamera={() => {
          setShowAddModal(false);
          setShowCameraModal(true);
        }}
      />
      
      <CameraModal 
        open={showCameraModal} 
        onOpenChange={setShowCameraModal}
        onPillScanned={() => {
          setShowCameraModal(false);
          setShowAddModal(true);
        }}
      />
    </div>
  );
}
