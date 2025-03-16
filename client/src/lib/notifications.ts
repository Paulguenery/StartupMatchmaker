import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Types de notifications supportés
export type NotificationType = 'match' | 'message' | 'project' | 'system';

export interface NotificationPayload {
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, string>;
}

// Service de notifications
export class NotificationService {
  private static instance: NotificationService;
  private messaging: any;
  private token: string | null = null;
  private notificationQueue: NotificationPayload[] = [];
  private isInitialized = false;

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

      this.isInitialized = true;

      // Traiter les notifications en attente
      while (this.notificationQueue.length > 0) {
        const notification = this.notificationQueue.shift();
        if (notification) {
          await this.sendNotification(notification.title, notification.body, notification.type, notification.data);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation des notifications:", error);
    }
  }

  async sendNotification(title: string, body: string, type: NotificationType = 'system', data?: Record<string, string>) {
    if (!this.isInitialized) {
      // Mettre en file d'attente si pas encore initialisé
      this.notificationQueue.push({ title, body, type, data });
      return;
    }

    try {
      // Notification native du navigateur en attendant Firebase
      new Notification(title, {
        body,
        icon: '/logo.png', // Assurez-vous d'avoir un logo
        tag: type,
        data
      });

      console.log("Notification envoyée:", { title, body, type, data });
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification:", error);
    }
  }

  // Méthodes spécifiques pour différents types de notifications
  async sendMatchNotification(projectTitle: string, matchType: 'new' | 'mutual') {
    const title = matchType === 'mutual' ? "Match mutuel !" : "Nouveau like !";
    const body = matchType === 'mutual' 
      ? `Vous avez un nouveau match pour le projet "${projectTitle}"`
      : `Quelqu'un a aimé votre projet "${projectTitle}"`;

    await this.sendNotification(title, body, 'match', { projectTitle });
  }

  async sendNewProjectNotification(projectTitle: string, distance: number) {
    const body = `Nouveau projet "${projectTitle}" à ${Math.round(distance)}km de chez vous`;
    await this.sendNotification("Nouveau projet !", body, 'project');
  }

  async sendMessageNotification(senderName: string, messagePreview: string) {
    await this.sendNotification(
      `Message de ${senderName}`,
      messagePreview,
      'message',
      { sender: senderName }
    );
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