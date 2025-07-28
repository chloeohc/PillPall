import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Phone } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SymptomTrackerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SymptomTrackerModal({ open, onOpenChange }: SymptomTrackerModalProps) {
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addSymptomMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/symptoms", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms"] });
      
      if (data.severity >= 4) {
        toast({
          title: "High Severity Symptoms Detected",
          description: "Consider contacting your doctor for severe symptoms",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Symptoms logged successfully",
        });
      }
      
      resetForm();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log symptoms",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setDescription("");
    setSeverity(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || severity === null) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const today = format(new Date(), "yyyy-MM-dd");
    
    addSymptomMutation.mutate({
      description,
      severity,
      date: today,
    });
  };

  const severityLevels = [
    { value: 1, emoji: "😊", label: "Mild", color: "bg-green-100 text-green-700 hover:bg-green-200" },
    { value: 2, emoji: "😐", label: "Low", color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
    { value: 3, emoji: "😕", label: "Moderate", color: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
    { value: 4, emoji: "😣", label: "High", color: "bg-red-100 text-red-700 hover:bg-red-200" },
    { value: 5, emoji: "😰", label: "Severe", color: "bg-red-200 text-red-800 hover:bg-red-300" },
  ];

  const callEmergency = () => {
    if (confirm("Call Emergency Services (911)?")) {
      window.location.href = "tel:911";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Symptoms</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="description">Describe your symptoms</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe how you're feeling..."
              className="h-24 resize-none mt-2"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-4 block">Severity Level</Label>
            <div className="grid grid-cols-5 gap-2">
              {severityLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setSeverity(level.value)}
                  className={`aspect-square rounded-lg text-xs font-medium transition-all ${level.color} ${
                    severity === level.value ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div className="text-lg">{level.emoji}</div>
                  <div>{level.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="text-red-600 mt-1 w-5 h-5" />
              <div>
                <h4 className="font-medium text-red-800">Emergency Symptoms</h4>
                <p className="text-sm text-red-700 mt-1">
                  If experiencing severe chest pain, difficulty breathing, or other emergency symptoms, 
                  contact emergency services immediately.
                </p>
                <Button 
                  type="button" 
                  onClick={callEmergency}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Emergency Services
                </Button>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={addSymptomMutation.isPending}
            >
              {addSymptomMutation.isPending ? "Logging..." : "Log Symptoms"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
