import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Camera, Search, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MedicationSearch from "./medication-search";

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

interface AddMedicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenCamera: () => void;
}

export default function AddMedicationModal({ open, onOpenChange, onOpenCamera }: AddMedicationModalProps) {
  const [activeTab, setActiveTab] = useState("search");
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "once_daily",
    times: [""],
    requiresFood: false,
    emptyStomach: false,
    foodReminderMinutes: 30,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addMedicationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/medications", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      toast({
        title: "Success",
        description: "Medication added successfully",
      });
      resetForm();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add medication",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      dosage: "",
      frequency: "once_daily",
      times: [""],
      requiresFood: false,
      emptyStomach: false,
      foodReminderMinutes: 30,
    });
    setActiveTab("search");
  };

  const handleSelectMedication = (medication: MedicationInfo) => {
    // Pre-fill form with selected medication data
    setFormData(prev => ({
      ...prev,
      name: medication.name,
      dosage: medication.dosages[0] || "",
      frequency: medication.commonFrequencies[0]?.includes("once") ? "once_daily" :
                 medication.commonFrequencies[0]?.includes("twice") ? "twice_daily" :
                 medication.commonFrequencies[0]?.includes("three") ? "three_times_daily" : "once_daily",
      requiresFood: medication.requiresFood,
      emptyStomach: medication.emptyStomach,
      times: medication.commonFrequencies[0]?.includes("once") ? ["08:00"] :
             medication.commonFrequencies[0]?.includes("twice") ? ["08:00", "20:00"] :
             medication.commonFrequencies[0]?.includes("three") ? ["08:00", "14:00", "20:00"] : ["08:00"],
    }));
    setActiveTab("manual");
  };

  const handleFrequencyChange = (value: string) => {
    let times = [""];
    switch (value) {
      case "twice_daily":
        times = ["", ""];
        break;
      case "three_times_daily":
        times = ["", "", ""];
        break;
      case "four_times_daily":
        times = ["", "", "", ""];
        break;
    }
    setFormData(prev => ({ ...prev, frequency: value, times }));
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData(prev => ({ ...prev, times: newTimes }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.dosage) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const validTimes = formData.times.filter(time => time.trim() !== "");
    if (validTimes.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one time",
        variant: "destructive",
      });
      return;
    }

    addMedicationMutation.mutate({
      ...formData,
      times: validTimes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Medication</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="flex items-center space-x-1">
              <Search className="w-3 h-3" />
              <span>Search</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center space-x-1">
              <Plus className="w-3 h-3" />
              <span>Manual</span>
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center space-x-1">
              <Camera className="w-3 h-3" />
              <span>Scan</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-4">
            <MedicationSearch onSelectMedication={handleSelectMedication} />
          </TabsContent>

          <TabsContent value="scan" className="mt-4">
            <div className="text-center py-8 space-y-4">
              <Camera className="w-16 h-16 text-gray-300 mx-auto" />
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Scan Your Pill</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Use your camera to identify pills and auto-fill medication information
                </p>
                <Button onClick={onOpenCamera} className="bg-primary hover:bg-primary/90">
                  <Camera className="w-4 h-4 mr-2" />
                  Open Camera
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <Label htmlFor="name">Medication Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter medication name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="10mg"
                required
              />
            </div>
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={formData.frequency} onValueChange={handleFrequencyChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once_daily">Once daily</SelectItem>
                  <SelectItem value="twice_daily">Twice daily</SelectItem>
                  <SelectItem value="three_times_daily">Three times daily</SelectItem>
                  <SelectItem value="four_times_daily">Four times daily</SelectItem>
                  <SelectItem value="as_needed">As needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Times</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {formData.times.map((time, index) => (
                <Input
                  key={index}
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  className="text-sm"
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresFood"
                checked={formData.requiresFood}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, requiresFood: checked as boolean, emptyStomach: false }))
                }
              />
              <Label htmlFor="requiresFood">Take with food</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emptyStomach"
                checked={formData.emptyStomach}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, emptyStomach: checked as boolean, requiresFood: false }))
                }
              />
              <Label htmlFor="emptyStomach">Take on empty stomach</Label>
            </div>
          </div>

          {formData.requiresFood && (
            <div>
              <Label htmlFor="foodReminder">Food reminder (minutes before dose)</Label>
              <Input
                id="foodReminder"
                type="number"
                value={formData.foodReminderMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, foodReminderMinutes: parseInt(e.target.value) || 30 }))}
                min={5}
                max={120}
              />
            </div>
          )}

              <div className="flex space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={addMedicationMutation.isPending}
                >
                  {addMedicationMutation.isPending ? "Adding..." : "Add Medication"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
