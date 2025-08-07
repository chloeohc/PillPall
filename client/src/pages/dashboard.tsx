import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Camera, ClipboardList, Phone, Pill, User } from "lucide-react";
import { format } from "date-fns";
import MedicationCard from "@/components/medication-card";
import AddMedicationModal from "@/components/add-medication-modal";
import SymptomTrackerModal from "@/components/symptom-tracker-modal";
import CameraModal from "@/components/camera-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { NotificationService } from "@/lib/notifications";

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch medications
  const { data: medications = [] } = useQuery<any[]>({
    queryKey: ["/api/medications"],
  });

  // Fetch today's doses
  const { data: doses = [] } = useQuery({
    queryKey: ["/api/doses", today],
    queryFn: async () => {
      const response = await fetch(`/api/doses?date=${today}`);
      return response.json();
    },
  });

  // Fetch recent symptoms
  const { data: recentSymptoms = [] } = useQuery({
    queryKey: ["/api/symptoms", "recent"],
    queryFn: async () => {
      const response = await fetch("/api/symptoms?recent=true&limit=3");
      return response.json();
    },
  });

  // Generate schedule mutation
  const generateScheduleMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/generate-schedule", { date: today });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doses", today] });
    },
  });

  // Mark dose as taken mutation
  const markAsTakenMutation = useMutation({
    mutationFn: async (doseId: string) => {
      const response = await apiRequest("PUT", `/api/doses/${doseId}`, {
        status: "taken",
        takenTime: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doses", today] });
      toast({
        title: "Success",
        description: "Medication marked as taken",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to mark medication as taken: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  // Take late mutation
  const takeLateMutation = useMutation({
    mutationFn: async (doseId: string) => {
      const response = await apiRequest("PUT", `/api/doses/${doseId}`, {
        status: "late",
        takenTime: new Date(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doses", today] });
      toast({
        title: "Success",
        description: "Late dose recorded",
      });
    },
  });

  // Generate schedule for today on component mount
  useEffect(() => {
    if (medications.length > 0 && doses.length === 0) {
      generateScheduleMutation.mutate();
    }
  }, [medications, doses]);

  // Setup notifications
  useEffect(() => {
    if (medications.length > 0) {
      NotificationService.scheduleNotifications(medications);
    }
  }, [medications]);

  // Request notification permission on mount
  useEffect(() => {
    NotificationService.requestPermission();
  }, []);

  const handleEmergencyContact = () => {
    if (confirm("Do you want to contact your emergency contact?")) {
      toast({
        title: "Emergency Contact",
        description: "Contacting your emergency contact...",
      });
    }
  };

  const handlePillScanned = (pillInfo: any) => {
    setShowCameraModal(false);
    setShowAddModal(true);
    // Pre-fill the form with scanned pill info
    // This would be implemented in the AddMedicationModal component
  };

  // Combine medications with their doses for display
  const medicationsWithDoses = medications.map(medication => {
    const medicationDoses = doses.filter((dose: any) => dose.medicationId === medication.id);
    return {
      medication,
      doses: medicationDoses,
    };
  }).filter(item => item.doses.length > 0);

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1: return "bg-green-400";
      case 2: return "bg-yellow-400";
      case 3: return "bg-orange-400";
      case 4: return "bg-red-400";
      case 5: return "bg-red-600";
      default: return "bg-gray-400";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "Yesterday";
    return format(date, "MMM d");
  };

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
              <h1 className="text-xl font-semibold text-gray-900">PillTracker</h1>
            </div>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-gray-100">
              <User className="text-gray-600 w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Today's Schedule Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
              <span className="text-sm text-gray-500">{format(new Date(), "MMM d, yyyy")}</span>
            </div>
            
            <div className="space-y-4">
              {medicationsWithDoses.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No medications scheduled for today</p>
                  <Button 
                    onClick={() => setShowAddModal(true)}
                    className="mt-3 bg-primary hover:bg-primary/90"
                  >
                    Add Your First Medication
                  </Button>
                </div>
              ) : (
                medicationsWithDoses.map(({ medication, doses }) =>
                  doses.map((dose: any) => (
                    <MedicationCard
                      key={dose.id}
                      medication={medication}
                      dose={{
                        ...dose,
                        scheduledTime: new Date(dose.scheduledTime),
                        takenTime: dose.takenTime ? new Date(dose.takenTime) : undefined,
                      }}
                      onMarkAsTaken={(doseId) => markAsTakenMutation.mutate(doseId)}
                      onTakeLate={(doseId) => takeLateMutation.mutate(doseId)}
                    />
                  ))
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => setShowAddModal(true)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-auto flex flex-col items-center space-y-3 hover:bg-gray-50"
          >
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Plus className="text-white w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900">Add Medication</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowCameraModal(true)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-auto flex flex-col items-center space-y-3 hover:bg-gray-50"
          >
            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
              <Camera className="text-white w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900">Scan Pill</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowSymptomModal(true)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-auto flex flex-col items-center space-y-3 hover:bg-gray-50"
          >
            <div className="w-12 h-12 bg-warning rounded-lg flex items-center justify-center">
              <ClipboardList className="text-white w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900">Log Symptoms</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleEmergencyContact}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-auto flex flex-col items-center space-y-3 hover:bg-red-50"
          >
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
              <Phone className="text-white w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900">Emergency</span>
          </Button>
        </div>

        {/* Recent Symptoms */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Symptoms</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSymptomModal(true)}
                className="text-primary text-sm font-medium"
              >
                View All
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentSymptoms.length === 0 ? (
                <p className="text-gray-500 text-sm">No symptoms logged recently</p>
              ) : (
                recentSymptoms.map((symptom: any) => (
                  <div key={symptom.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(symptom.severity)}`}></div>
                      <span className="text-sm text-gray-900">{symptom.description}</span>
                    </div>
                    <span className="text-xs text-gray-500">{formatTimeAgo(symptom.timestamp)}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
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
      
      <SymptomTrackerModal 
        open={showSymptomModal} 
        onOpenChange={setShowSymptomModal} 
      />
      
      <CameraModal 
        open={showCameraModal} 
        onOpenChange={setShowCameraModal}
        onPillScanned={handlePillScanned}
      />
    </div>
  );
}
