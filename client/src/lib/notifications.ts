import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Service de notifications
export class NotificationService {
  private static instance: NotificationService;
  private messaging: any;
  private token: string | null = null;

  private constructor() {
    // La configuration sera faite plus tard
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async init() {
    try {
      if (!("Notification" in window)) {
        console.log("Ce navigateur ne supporte pas les notifications");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Permission des notifications refusée");
        return;
      }

      // La configuration Firebase sera faite plus tard
      // this.messaging = getMessaging();
      // this.token = await getToken(this.messaging, { vapidKey: process.env.FIREBASE_VAPID_KEY });
    } catch (error) {
      console.error("Erreur lors de l'initialisation des notifications:", error);
    }
  }

  async sendNotification(title: string, body: string) {
    if (!this.token) {
      console.log("Token FCM non disponible");
      return;
    }

    try {
      // L'envoi de notifications sera configuré plus tard avec la clé serveur
      console.log("Envoi de notification (à implémenter):", { title, body });
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification:", error);
    }
  }

  // Écouter les notifications entrantes
  onNotificationReceived(callback: (payload: any) => void) {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      callback(payload);
    });
  }
}

export const notificationService = NotificationService.getInstance();
