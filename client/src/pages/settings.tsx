import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Phone, Bell, User, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [formData, setFormData] = useState({
    emergencyContactName: "",
    emergencyContactPhone: "",
    doctorName: "",
    doctorPhone: "",
    notificationsEnabled: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user settings
  const { data: settings, isLoading } = useQuery<any>({
    queryKey: ["/api/settings"],
    staleTime: 0,
  });

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        emergencyContactName: settings.emergencyContactName || "",
        emergencyContactPhone: settings.emergencyContactPhone || "",
        doctorName: settings.doctorName || "",
        doctorPhone: settings.doctorPhone || "",
        notificationsEnabled: settings.notificationsEnabled ?? true,
      });
    }
  }, [settings]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  const handleNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setFormData(prev => ({ ...prev, notificationsEnabled: true }));
        toast({
          title: "Success",
          description: "Notifications enabled",
        });
      } else {
        setFormData(prev => ({ ...prev, notificationsEnabled: false }));
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings",
          variant: "destructive",
        });
      }
    }
  };

  const testEmergencyContact = () => {
    if (formData.emergencyContactPhone) {
      if (confirm(`Call ${formData.emergencyContactName || 'Emergency Contact'} at ${formData.emergencyContactPhone}?`)) {
        window.location.href = `tel:${formData.emergencyContactPhone}`;
      }
    } else {
      toast({
        title: "No Emergency Contact",
        description: "Please add an emergency contact first",
        variant: "destructive",
      });
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
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <SettingsIcon className="text-white w-4 h-4" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Emergency Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-red-600" />
                <span>Emergency Contact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="emergencyName">Contact Name</Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                  placeholder="Enter emergency contact name"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Phone Number</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={testEmergencyContact}
                className="w-full"
              >
                <Phone className="w-4 h-4 mr-2" />
                Test Emergency Contact
              </Button>
            </CardContent>
          </Card>

          {/* Doctor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Doctor Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="doctorName">Doctor Name</Label>
                <Input
                  id="doctorName"
                  value={formData.doctorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, doctorName: e.target.value }))}
                  placeholder="Enter doctor's name"
                />
              </div>
              <div>
                <Label htmlFor="doctorPhone">Doctor Phone</Label>
                <Input
                  id="doctorPhone"
                  type="tel"
                  value={formData.doctorPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, doctorPhone: e.target.value }))}
                  placeholder="Enter doctor's phone number"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-yellow-600" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Medication Reminders</Label>
                  <p className="text-sm text-gray-500">Get notified when it's time to take your medication</p>
                </div>
                <Switch
                  id="notifications"
                  checked={formData.notificationsEnabled}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleNotificationPermission();
                    } else {
                      setFormData(prev => ({ ...prev, notificationsEnabled: false }));
                    }
                  }}
                />
              </div>
              
              {!formData.notificationsEnabled && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    Notifications are disabled. You won't receive medication reminders.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>Privacy & Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Data is stored locally</span>
                  <span className="text-xs text-green-600 font-medium">Secure</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">No data sharing</span>
                  <span className="text-xs text-green-600 font-medium">Private</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">HIPAA compliant design</span>
                  <span className="text-xs text-green-600 font-medium">Protected</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={updateSettingsMutation.isPending}
          >
            {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </form>

        {/* App Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-gray-900">PillTracker</h3>
              <p className="text-sm text-gray-500">Version 1.0.0</p>
              <p className="text-xs text-gray-400">
                Your personal medication companion
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
