import { useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

type GradeMention = {
  min: number;
  max: number;
  label: string;
  label_en: string;
  color: string;
};

/**
 * Hook personnalisé pour gérer les spécificités du système scolaire (français ou anglais)
 */
export function useSchoolSystem() {
  const { currentSchool } = useAuth();
  
  // Détermine le système scolaire actuel (français ou anglais)
  const schoolSystem = useMemo(() => {
    return (currentSchool as any)?.schoolSystem || 'french';
  }, [currentSchool]);

  // Mentions pour le système français
  const frenchGradeMentions: GradeMention[] = [
    { min: 0, max: 9.99, label: 'Insuffisant', label_en: 'Insufficient', color: '#ef4444' },
    { min: 10, max: 11.99, label: 'Passable', label_en: 'Fair', color: '#f97316' },
    { min: 12, max: 13.99, label: 'Assez Bien', label_en: 'Fairly Good', color: '#eab308' },
    { min: 14, max: 15.99, label: 'Bien', label_en: 'Good', color: '#22c55e' },
    { min: 16, max: 17.99, label: 'Très Bien', label_en: 'Very Good', color: '#3b82f6' },
    { min: 18, max: 20, label: 'Excellent', label_en: 'Excellent', color: '#8b5cf6' },
  ];

  // Mentions pour le système anglais
  const englishGradeMentions: GradeMention[] = [
    { min: 0, max: 9.99, label: 'Échec', label_en: 'Fail', color: '#ef4444' },
    { min: 10, max: 11.99, label: 'Passable', label_en: 'Pass', color: '#f97316' },
    { min: 12, max: 13.99, label: 'Satisfaisant', label_en: 'Satisfactory', color: '#eab308' },
    { min: 14, max: 15.99, label: 'Mérite', label_en: 'Merit', color: '#22c55e' },
    { min: 16, max: 17.99, label: 'Distinction', label_en: 'Distinction', color: '#3b82f6' },
    { min: 18, max: 20, label: 'Excellence', label_en: 'Excellence', color: '#8b5cf6' },
  ];

  /**
   * Récupère les mentions de notes en fonction du système scolaire
   */
  const getGradeMentions = useCallback((): GradeMention[] => {
    return schoolSystem === 'english' ? englishGradeMentions : frenchGradeMentions;
  }, [schoolSystem]);

  /**
   * Vérifie si le système scolaire est français
   */
  const isFrenchSystem = useCallback((): boolean => {
    return schoolSystem === 'french';
  }, [schoolSystem]);

  /**
   * Vérifie si le système scolaire est anglais
   */
  const isEnglishSystem = useCallback((): boolean => {
    return schoolSystem === 'english';
  }, [schoolSystem]);

  /**
   * Obtient le nom du système scolaire actuel
   */
  const getSystemName = useCallback((language: 'fr' | 'en' = 'fr'): string => {
    if (schoolSystem === 'english') {
      return language === 'fr' ? 'Anglophone' : 'English';
    }
    return language === 'fr' ? 'Francophone' : 'French';
  }, [schoolSystem]);

  return {
    schoolSystem,
    getGradeMentions,
    isFrenchSystem,
    isEnglishSystem,
    getSystemName,
  };
}