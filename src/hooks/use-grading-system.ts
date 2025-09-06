import { useMemo, useCallback } from 'react';
import { useSchoolSystem } from '@/hooks/use-school-system';

type GradeMention = {
  min: number;
  max: number;
  label: string;
  label_en: string;
  color: string;
};

interface UseGradingSystemProps {
  maxScore?: number;
  language?: 'fr' | 'en';
}

/**
 * Hook personnalisé pour gérer le système de notation camerounais
 * Par défaut, notation sur 20 avec mentions appropriées
 */
export function useGradingSystem({
  maxScore = 20,
  language = 'fr',
}: UseGradingSystemProps = {}) {
  const { getGradeMentions } = useSchoolSystem();
  
  // Récupérer les mentions de notes selon le système scolaire actuel
  const gradeMentions = useMemo(() => {
    return getGradeMentions();
  }, [getGradeMentions]);

  /**
   * Calcule la mention correspondant à une note
   */
  const getMention = (score: number): GradeMention | null => {
    if (score < 0 || score > maxScore) return null;
    
    // Convertir la note sur 20 si nécessaire
    const scoreOn20 = maxScore === 20 ? score : (score * 20) / maxScore;
    
    // Trouver la mention correspondante
    return gradeMentions.find(
      (mention) => scoreOn20 >= mention.min && scoreOn20 <= mention.max
    ) || null;
  };

  /**
   * Obtient le libellé de la mention pour une note donnée
   */
  const getMentionLabel = (score: number): string => {
    const mention = getMention(score);
    if (!mention) return '';
    
    return language === 'en' ? mention.label_en : mention.label;
  };

  /**
   * Obtient la couleur associée à une note
   */
  const getScoreColor = (score: number): string => {
    const mention = getMention(score);
    return mention ? mention.color : '#6b7280'; // Gris par défaut
  };

  /**
   * Vérifie si une note est valide (entre 0 et maxScore)
   */
  const isValidScore = (score: number): boolean => {
    return score >= 0 && score <= maxScore;
  };

  /**
   * Calcule la moyenne d'un ensemble de notes
   */
  const calculateAverage = (scores: number[]): number => {
    if (scores.length === 0) return 0;
    
    const validScores = scores.filter(isValidScore);
    if (validScores.length === 0) return 0;
    
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    return parseFloat((sum / validScores.length).toFixed(2));
  };

  /**
   * Calcule la moyenne pondérée d'un ensemble de notes avec coefficients
   */
  const calculateWeightedAverage = (
    scores: Array<{ score: number; coefficient: number }>
  ): number => {
    if (scores.length === 0) return 0;
    
    const validScores = scores.filter((item) => isValidScore(item.score));
    if (validScores.length === 0) return 0;
    
    const weightedSum = validScores.reduce(
      (acc, item) => acc + item.score * item.coefficient,
      0
    );
    
    const totalCoefficient = validScores.reduce(
      (acc, item) => acc + item.coefficient,
      0
    );
    
    return parseFloat((weightedSum / totalCoefficient).toFixed(2));
  };

  /**
   * Détermine si un élève est admis en fonction de sa moyenne
   * Par défaut, la moyenne requise est de 10/20
   */
  const isStudentPassing = (average: number, requiredAverage = 10): boolean => {
    // Convertir la moyenne sur 20 si nécessaire
    const averageOn20 = maxScore === 20 ? average : (average * 20) / maxScore;
    return averageOn20 >= requiredAverage;
  };

  /**
   * Calcule le rang d'un élève en fonction de sa moyenne et des moyennes de sa classe
   */
  const calculateRank = (studentAverage: number, classAverages: number[]): number => {
    if (classAverages.length === 0) return 1;
    
    // Trier les moyennes par ordre décroissant
    const sortedAverages = [...classAverages].sort((a, b) => b - a);
    
    // Trouver le rang (position + 1)
    const rank = sortedAverages.findIndex((avg) => avg === studentAverage) + 1;
    return rank > 0 ? rank : classAverages.length + 1;
  };

  return {
    maxScore,
    gradeMentions,
    getMention,
    getMentionLabel,
    getScoreColor,
    isValidScore,
    calculateAverage,
    calculateWeightedAverage,
    isStudentPassing,
    calculateRank,
  };
}