import { 
  doc, 
  getDoc, 
  setDoc, 
  collection,
  getDocs, 
  addDoc,
  updateDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { userService } from './services';

// Interface pour la gestion des abonnements
export interface Subscription {
  id: string;
  userId: string;
  status: 'active' | 'cancelled' | 'past_due';
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  startDate: Date | Timestamp;
  endDate?: Date | Timestamp;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  cancelledAt?: Date | Timestamp;
  paymentMethod?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Service pour gérer les abonnements premium
export const subscriptionService = {
  // Activer l'abonnement premium pour un utilisateur
  async activatePremium(
    userId: string, 
    subscriptionData?: Partial<Omit<Subscription, 'id' | 'userId' | 'status' | 'startDate' | 'createdAt' | 'updatedAt'>>
  ): Promise<string | null> {
    try {
      // Mise à jour du statut utilisateur
      await userService.updateUserSubscription(userId, 'premium');
      
      // Si des données d'abonnement sont fournies, les enregistrer
      if (subscriptionData) {
        const subscriptionRef = doc(collection(db, "subscriptions"));
        const id = subscriptionRef.id;
        
        const now = new Date();
        const subscriptionRecord = {
          id,
          userId,
          status: 'active',
          planId: subscriptionData.planId || 'premium-monthly',
          planName: subscriptionData.planName || 'Premium Mensuel',
          amount: subscriptionData.amount || 9.90,
          currency: subscriptionData.currency || 'EUR',
          startDate: now,
          ...subscriptionData,
          createdAt: now,
          updatedAt: now
        };
        
        await setDoc(subscriptionRef, subscriptionRecord);
        return id;
      }
      
      return null;
    } catch (error) {
      console.error("Erreur lors de l'activation de l'abonnement premium:", error);
      throw error;
    }
  },

  // Désactiver l'abonnement premium
  async cancelPremium(userId: string): Promise<void> {
    try {
      // Mise à jour du statut utilisateur
      await userService.updateUserSubscription(userId, 'free');

      // Mettre à jour les données d'abonnement si elles existent
      const subscriptionsRef = collection(db, "subscriptions");
      const q = query(
        subscriptionsRef,
        where("userId", "==", userId),
        where("status", "==", "active")
      );

      const querySnapshot = await getDocs(q);
      const now = new Date();
      
      querySnapshot.forEach(async (document) => {
        await updateDoc(doc(db, "subscriptions", document.id), {
          status: "cancelled",
          cancelledAt: now,
          endDate: now,
          updatedAt: now
        });
      });
    } catch (error) {
      console.error("Erreur lors de l'annulation de l'abonnement premium:", error);
      throw error;
    }
  },

  // Vérifier si un utilisateur a un abonnement premium actif
  async checkPremiumStatus(userId: string): Promise<boolean> {
    try {
      const userDoc = await userService.getUserById(userId);
      if (userDoc) {
        return userDoc.userType === "premium";
      }
      return false;
    } catch (error) {
      console.error("Erreur lors de la vérification du statut premium:", error);
      return false;
    }
  },
  
  // Récupérer l'abonnement actif d'un utilisateur
  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    try {
      const subscriptionsRef = collection(db, "subscriptions");
      const q = query(
        subscriptionsRef,
        where("userId", "==", userId),
        where("status", "==", "active")
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }
      
      // Retourner le premier abonnement actif trouvé
      const subDoc = querySnapshot.docs[0];
      const subData = subDoc.data() as Subscription;
      
      // Convertir les timestamps Firestore en objets Date JavaScript
      const startDate = subData.startDate instanceof Date ? subData.startDate : 
        ((subData.startDate as any)?.seconds ? new Date((subData.startDate as any).seconds * 1000) : new Date());
      const endDate = subData.endDate instanceof Date ? subData.endDate : 
        ((subData.endDate as any)?.seconds ? new Date((subData.endDate as any).seconds * 1000) : undefined);
      const createdAt = subData.createdAt instanceof Date ? subData.createdAt : 
        ((subData.createdAt as any)?.seconds ? new Date((subData.createdAt as any).seconds * 1000) : new Date());
      const updatedAt = subData.updatedAt instanceof Date ? subData.updatedAt : 
        ((subData.updatedAt as any)?.seconds ? new Date((subData.updatedAt as any).seconds * 1000) : new Date());
      
      return {
        ...subData,
        startDate,
        endDate,
        createdAt,
        updatedAt
      };
    } catch (error) {
      console.error("Erreur lors de la récupération de l'abonnement actif:", error);
      return null;
    }
  },
  
  // Récupérer l'historique des abonnements d'un utilisateur
  async getSubscriptionHistory(userId: string): Promise<Subscription[]> {
    try {
      const subscriptionsRef = collection(db, "subscriptions");
      const q = query(
        subscriptionsRef,
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(q);
      const subscriptions: Subscription[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Subscription;
        // Convertir les timestamps Firestore en objets Date JavaScript
        const startDate = data.startDate instanceof Date ? data.startDate : 
          ((data.startDate as any)?.seconds ? new Date((data.startDate as any).seconds * 1000) : new Date());
        const endDate = data.endDate instanceof Date ? data.endDate : 
          ((data.endDate as any)?.seconds ? new Date((data.endDate as any).seconds * 1000) : undefined);
        const createdAt = data.createdAt instanceof Date ? data.createdAt : 
          ((data.createdAt as any)?.seconds ? new Date((data.createdAt as any).seconds * 1000) : new Date());
        const updatedAt = data.updatedAt instanceof Date ? data.updatedAt : 
          ((data.updatedAt as any)?.seconds ? new Date((data.updatedAt as any).seconds * 1000) : new Date());
        
        subscriptions.push({
          ...data,
          startDate,
          endDate,
          createdAt,
          updatedAt
        });
      });
      
      // Trier par date de création décroissante
      return subscriptions.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date((a.createdAt as any)?.seconds * 1000 || 0);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date((b.createdAt as any)?.seconds * 1000 || 0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique des abonnements:", error);
      return [];
    }
  },
  
  // Mettre à jour un abonnement avec les données de Stripe
  async updateSubscriptionWithStripeData(
    subscriptionId: string,
    stripeData: {
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
      planId?: string;
      status?: 'active' | 'cancelled' | 'past_due';
      endDate?: Date;
    }
  ): Promise<void> {
    try {
      const subscriptionRef = doc(db, "subscriptions", subscriptionId);
      await updateDoc(subscriptionRef, {
        ...stripeData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour des données Stripe:", error);
      throw error;
    }
  }
};
