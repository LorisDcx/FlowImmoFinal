import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { UserProfile } from '../context/AuthContext';
import { CalculatorInputs, CalculatorResults } from '../context/CalculatorContext';

// Type pour les projets immobiliers sauvegardés
export interface RealEstateProject {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  inputs: CalculatorInputs;
  results: CalculatorResults;
  favorite?: boolean;
}

// Service pour les utilisateurs
export const userService = {
  // Récupérer un utilisateur par son ID
  async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      throw error;
    }
  },

  // Mettre à jour le profil utilisateur
  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      throw error;
    }
  },

  // Mettre à jour le type d'abonnement de l'utilisateur (gratuit ou premium)
  async updateUserSubscription(userId: string, userType: 'free' | 'premium'): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        userType,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'abonnement:", error);
      throw error;
    }
  }
};

// Service pour les projets immobiliers
export const projectService = {
  // Créer un nouveau projet
  async createProject(projectData: Omit<RealEstateProject, 'id'>): Promise<string> {
    try {
      // Créer une nouvelle référence de document avec un ID généré
      const projectRef = doc(collection(db, "projects"));
      const id = projectRef.id;
      
      // Définir les données avec l'ID généré
      await setDoc(projectRef, {
        ...projectData,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return id;
    } catch (error) {
      console.error("Erreur lors de la création du projet:", error);
      throw error;
    }
  },

  // Récupérer tous les projets d'un utilisateur
  async getProjectsByUserId(userId: string): Promise<RealEstateProject[]> {
    try {
      const q = query(collection(db, "projects"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const projects: RealEstateProject[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as RealEstateProject;
        // Convertir les timestamps Firestore en objets Date JavaScript
        const createdAt = data.createdAt instanceof Date ? data.createdAt : 
          (data.createdAt && 'seconds' in data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date());
        const updatedAt = data.updatedAt instanceof Date ? data.updatedAt : 
          (data.updatedAt && 'seconds' in data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : new Date());
        
        projects.push({
          ...data,
          createdAt,
          updatedAt
        });
      });
      
      return projects;
    } catch (error) {
      console.error("Erreur lors de la récupération des projets:", error);
      throw error;
    }
  },

  // Récupérer un projet par son ID
  async getProjectById(projectId: string): Promise<RealEstateProject | null> {
    try {
      const projectDoc = await getDoc(doc(db, "projects", projectId));
      
      if (projectDoc.exists()) {
        const data = projectDoc.data() as RealEstateProject;
        // Convertir les timestamps Firestore en objets Date JavaScript
        const createdAt = data.createdAt instanceof Date ? data.createdAt : 
          (data.createdAt && 'seconds' in data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date());
        const updatedAt = data.updatedAt instanceof Date ? data.updatedAt : 
          (data.updatedAt && 'seconds' in data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : new Date());
        
        return {
          ...data,
          createdAt,
          updatedAt
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du projet:", error);
      throw error;
    }
  },

  // Mettre à jour un projet
  async updateProject(projectId: string, data: Partial<RealEstateProject>): Promise<void> {
    try {
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du projet:", error);
      throw error;
    }
  },

  // Supprimer un projet
  async deleteProject(projectId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "projects", projectId));
    } catch (error) {
      console.error("Erreur lors de la suppression du projet:", error);
      throw error;
    }
  },

  // Marquer un projet comme favori
  async toggleFavorite(projectId: string, isFavorite: boolean): Promise<void> {
    try {
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, {
        favorite: isFavorite,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du favori:", error);
      throw error;
    }
  }
};

// Service pour les données de l'application (statistiques, paramètres, etc.)
export const appDataService = {
  // Récupérer les paramètres globaux de l'application
  async getAppSettings(): Promise<any> {
    try {
      const settingsDoc = await getDoc(doc(db, "appSettings", "global"));
      
      if (settingsDoc.exists()) {
        return settingsDoc.data();
      } else {
        return {};
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des paramètres:", error);
      throw error;
    }
  },

  // Enregistrer une analyse (pour statistiques)
  async logCalculation(userId: string, calculationData: any): Promise<void> {
    try {
      const logRef = doc(collection(db, "calculationLogs"));
      await setDoc(logRef, {
        userId,
        calculationData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du calcul:", error);
      // Ne pas lancer d'erreur pour ne pas perturber l'expérience utilisateur
    }
  }
};
