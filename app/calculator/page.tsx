"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CalculatorHeader from '../../components/calculator/CalculatorHeader';
import CalculatorForm from '../../components/calculator/CalculatorForm';
import CalculatorResults from '../../components/calculator/CalculatorResults';
import SaveProjectForm from '../../components/calculator/SaveProjectForm';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../firebase/services';
import { CalculatorProvider, useCalculator } from '../../context/CalculatorContext';

// Composant intermédiaire pour charger les données de projet si nécessaire
function CalculatorWithProject() {
  const { currentUser } = useAuth();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { setInputs } = useCalculator();
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    // Charger un projet existant si un projectId est fourni et que l'utilisateur est connecté
    if (projectId && currentUser) {
      const loadProject = async () => {
        try {
          setIsLoading(true);
          const project = await projectService.getProjectById(projectId);
          
          if (project && project.userId === currentUser.uid) {
            // Charger les inputs du projet dans le calculateur
            setInputs(project.inputs);
          } else {
            setLoadError('Projet non trouvé ou vous n\'avez pas accès à ce projet.');
          }
        } catch (err) {
          console.error('Erreur lors du chargement du projet:', err);
          setLoadError('Impossible de charger le projet. Veuillez réessayer.');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadProject();
    }
  }, [projectId, currentUser, setInputs]);

  return (
    <div className="mt-12">
      {isLoading ? (
        <div className="text-center py-8">
          <p>Chargement du projet...</p>
        </div>
      ) : loadError ? (
        <div className="bg-red-50 border border-red-500 text-red-700 p-4 rounded mb-8">
          {loadError}
        </div>
      ) : (
        <>
          {/* Formulaire de sauvegarde (pour utilisateurs connectés) */}
          <SaveProjectForm />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire du calculateur (2/3 de la largeur) */}
            <div className="lg:col-span-2">
              <CalculatorForm />
            </div>
            
            {/* Résultats du calculateur (1/3 de la largeur) */}
            <div className="lg:col-span-1">
              <CalculatorResults />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <CalculatorHeader />
        
        <CalculatorProvider>
          <CalculatorWithProject />
        </CalculatorProvider>
      </div>
    </main>
  );
}
