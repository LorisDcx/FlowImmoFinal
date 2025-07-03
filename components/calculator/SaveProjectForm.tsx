"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCalculator } from '@/context/CalculatorContext';
import { projectService } from '@/firebase/services';

export default function SaveProjectForm() {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { currentUser } = useAuth();
  const { inputs, results } = useCalculator();
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      setError('Veuillez donner un nom à votre projet.');
      return;
    }
    
    if (!currentUser) {
      router.push('/login?redirect=/calculator');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');

      // Création du projet dans Firestore
      await projectService.createProject({
        userId: currentUser.uid,
        name: projectName,
        description: projectDescription,
        createdAt: new Date(),
        updatedAt: new Date(),
        inputs: inputs,
        results: results,
        favorite: false,
      });

      setSuccess('Projet sauvegardé avec succès !');
      setProjectName('');
      setProjectDescription('');
      setShowForm(false);
      
      // Rediriger vers le tableau de bord après un court délai
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      setError('Une erreur est survenue lors de la sauvegarde du projet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si l'utilisateur n'est pas connecté
  if (!currentUser) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-lg">Sauvegarder votre simulation</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Connectez-vous pour sauvegarder vos simulations et y accéder à tout moment.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={() => router.push('/login?redirect=/calculator')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Se connecter
          </button>
          <button
            onClick={() => router.push('/register?redirect=/calculator')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Créer un compte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-lg">Sauvegarder votre simulation</h3>
      </div>
      
      {success && (
        <div className="bg-green-50 border border-green-500 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {!showForm ? (
        <div>
          <p className="text-gray-600 mb-4">
            Sauvegardez cette simulation pour y accéder facilement plus tard et suivre vos projets immobiliers.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sauvegarder ce projet
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          {error && (
            <div className="bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du projet *
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Ex: Studio Paris 11ème"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optionnelle)
            </label>
            <textarea
              id="projectDescription"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Détails supplémentaires sur le projet..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sauvegarde en cours...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
