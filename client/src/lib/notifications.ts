export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async showMedicationReminder(medicationName: string, dosage: string, time: string) {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    new Notification(`Time to take ${medicationName}`, {
      body: `Take ${dosage} at ${time}`,
      icon: '/favicon.ico',
      tag: 'medication-reminder',
      requireInteraction: true,
    });
  }

  static async showFoodReminder(medicationName: string, minutesUntilDose: number) {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    new Notification('Eat something before your medication', {
      body: `${medicationName} should be taken with food in ${minutesUntilDose} minutes`,
      icon: '/favicon.ico',
      tag: 'food-reminder',
    });
  }

  static async scheduleNotifications(medications: any[]) {
    // In a real app, this would use service workers for persistent notifications
    // For now, we'll use setTimeout for demo purposes
    const now = new Date();
    
    medications.forEach(medication => {
      medication.times.forEach((time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const scheduleTime = new Date();
        scheduleTime.setHours(hours, minutes, 0, 0);
        
        // If time has passed today, schedule for tomorrow
        if (scheduleTime <= now) {
          scheduleTime.setDate(scheduleTime.getDate() + 1);
        }
        
        const timeUntilNotification = scheduleTime.getTime() - now.getTime();
        
        // Schedule food reminder if needed
        if (medication.requiresFood && medication.foodReminderMinutes > 0) {
          const foodReminderTime = timeUntilNotification - (medication.foodReminderMinutes * 60 * 1000);
          if (foodReminderTime > 0) {
            setTimeout(() => {
              this.showFoodReminder(medication.name, medication.foodReminderMinutes);
            }, foodReminderTime);
          }
        }
        
        // Schedule medication reminder
        if (timeUntilNotification > 0) {
          setTimeout(() => {
            this.showMedicationReminder(medication.name, medication.dosage, time);
          }, timeUntilNotification);
        }
      });
    });
  }
}
