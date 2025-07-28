import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Check, Pill } from "lucide-react";
import { format } from "date-fns";

interface MedicationCardProps {
  medication: {
    id: string;
    name: string;
    dosage: string;
    requiresFood: boolean;
  };
  dose: {
    id: string;
    scheduledTime: Date;
    status: string;
    takenTime?: Date;
  };
  onMarkAsTaken: (doseId: string) => void;
  onTakeLate: (doseId: string) => void;
}

export default function MedicationCard({ medication, dose, onMarkAsTaken, onTakeLate }: MedicationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-50 border-blue-200";
      case "taken": return "bg-green-50 border-green-200 opacity-75";
      case "missed": return "bg-red-50 border-red-200";
      case "late": return "bg-yellow-50 border-yellow-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  const getIconColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-primary";
      case "taken": return "bg-secondary";
      case "missed": return "bg-accent";
      case "late": return "bg-warning";
      default: return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "taken": return <Check className="text-white w-5 h-5" />;
      case "missed": return <AlertTriangle className="text-white w-5 h-5" />;
      default: return <Pill className="text-white w-5 h-5" />;
    }
  };

  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  return (
    <div className={`flex items-center space-x-4 p-4 rounded-lg border ${getStatusColor(dose.status)}`}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIconColor(dose.status)}`}>
        {getStatusIcon(dose.status)}
      </div>
      
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{medication.name} {medication.dosage}</h3>
        <div className="flex items-center space-x-2 mt-1">
          {dose.status === "taken" && dose.takenTime ? (
            <p className="text-sm text-gray-600">Taken at {formatTime(dose.takenTime)}</p>
          ) : dose.status === "missed" ? (
            <p className="text-sm text-red-600">Missed dose: {formatTime(dose.scheduledTime)}</p>
          ) : (
            <p className="text-sm text-gray-600">Next dose: {formatTime(dose.scheduledTime)}</p>
          )}
        </div>
        {medication.requiresFood && dose.status === "pending" && (
          <div className="flex items-center space-x-1 mt-1">
            <AlertTriangle className="w-3 h-3 text-blue-600" />
            <p className="text-xs text-blue-600">Take with food</p>
          </div>
        )}
      </div>
      
      <div className="flex flex-col space-y-2">
        {dose.status === "pending" && (
          <Button
            size="sm"
            onClick={() => onMarkAsTaken(dose.id)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Take Now
          </Button>
        )}
        {dose.status === "missed" && (
          <Button
            size="sm"
            onClick={() => onTakeLate(dose.id)}
            className="bg-accent hover:bg-accent/90 text-white"
          >
            Take Late
          </Button>
        )}
        {dose.status === "taken" && (
          <Badge className="bg-secondary text-white">
            <Check className="w-3 h-3 mr-1" />
            Done
          </Badge>
        )}
      </div>
    </div>
  );
}
