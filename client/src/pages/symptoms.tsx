import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Calendar } from "lucide-react";
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import SymptomTrackerModal from "@/components/symptom-tracker-modal";

export default function Symptoms() {
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  // Fetch all symptoms
  const { data: symptoms = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/symptoms"],
  });

  const getSeverityInfo = (severity: number) => {
    switch (severity) {
      case 1: return { label: "Mild", color: "bg-green-100 text-green-800", emoji: "😊" };
      case 2: return { label: "Low", color: "bg-yellow-100 text-yellow-800", emoji: "😐" };
      case 3: return { label: "Moderate", color: "bg-orange-100 text-orange-800", emoji: "😕" };
      case 4: return { label: "High", color: "bg-red-100 text-red-800", emoji: "😣" };
      case 5: return { label: "Severe", color: "bg-red-200 text-red-900", emoji: "😰" };
      default: return { label: "Unknown", color: "bg-gray-100 text-gray-800", emoji: "❓" };
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: format(date, "MMM d, yyyy"),
      time: format(date, "h:mm a"),
    };
  };

  // Group symptoms by date
  const symptomsByDate = symptoms.reduce((acc: any, symptom: any) => {
    const date = symptom.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(symptom);
    return acc;
  }, {});

  // Get week days for the week view
  const weekStart = startOfWeek(selectedWeek);
  const weekEnd = endOfWeek(selectedWeek);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Calculate weekly severity average
  const getWeeklyAverage = () => {
    const weekSymptoms = symptoms.filter((symptom: any) => {
      const symptomDate = parseISO(symptom.date);
      return symptomDate >= weekStart && symptomDate <= weekEnd;
    });
    
    if (weekSymptoms.length === 0) return 0;
    
    const total = weekSymptoms.reduce((sum: number, symptom: any) => sum + symptom.severity, 0);
    return (total / weekSymptoms.length).toFixed(1);
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
                <TrendingUp className="text-white w-4 h-4" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Symptoms</h1>
            </div>
            <Button 
              onClick={() => setShowSymptomModal(true)}
              size="icon"
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Weekly Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Weekly Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
              </p>
              <p className="text-lg font-semibold">
                Average Severity: {getWeeklyAverage()}
              </p>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-4">
              {weekDays.map(day => {
                const dateStr = format(day, "yyyy-MM-dd");
                const daySymptoms = symptomsByDate[dateStr] || [];
                const avgSeverity = daySymptoms.length > 0 
                  ? daySymptoms.reduce((sum: number, s: any) => sum + s.severity, 0) / daySymptoms.length 
                  : 0;
                
                const getSeverityColor = (severity: number) => {
                  if (severity === 0) return "bg-gray-100";
                  if (severity <= 2) return "bg-green-200";
                  if (severity <= 3) return "bg-yellow-200";
                  if (severity <= 4) return "bg-orange-200";
                  return "bg-red-200";
                };

                return (
                  <div key={dateStr} className="text-center">
                    <div className="text-xs text-gray-500 mb-1">
                      {format(day, "E")}
                    </div>
                    <div 
                      className={`w-8 h-8 rounded ${getSeverityColor(avgSeverity)} flex items-center justify-center text-xs font-medium`}
                    >
                      {format(day, "d")}
                    </div>
                    {daySymptoms.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {daySymptoms.length}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Symptoms List */}
        {symptoms.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No symptoms logged yet</h3>
            <p className="text-gray-500 mb-6">Start tracking your symptoms to monitor your health</p>
            <Button 
              onClick={() => setShowSymptomModal(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log First Symptom
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Symptoms</h2>
            
            {Object.keys(symptomsByDate)
              .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
              .map(date => (
                <Card key={date} className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">
                      {format(parseISO(date), "EEEE, MMMM d, yyyy")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {symptomsByDate[date].map((symptom: any) => {
                      const severityInfo = getSeverityInfo(symptom.severity);
                      const dateTime = formatDateTime(symptom.timestamp);
                      
                      return (
                        <div key={symptom.id} className="border-l-4 border-primary pl-4 py-2">
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={severityInfo.color}>
                              {severityInfo.emoji} {severityInfo.label}
                            </Badge>
                            <span className="text-xs text-gray-500">{dateTime.time}</span>
                          </div>
                          <p className="text-sm text-gray-700">{symptom.description}</p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </main>

      {/* Modal */}
      <SymptomTrackerModal 
        open={showSymptomModal} 
        onOpenChange={setShowSymptomModal} 
      />
    </div>
  );
}
