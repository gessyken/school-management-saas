import { useState, useCallback } from 'react';
import studentService from '../services/studentService';

interface UseStudentRegistrationNumberProps {
  schoolId: string;
  academicYearId: string;
  schoolPrefix?: string;
}

/**
 * Hook personnalisé pour générer et valider les matricules d'élèves
 * Format: ANNEE-ECOLE-XXX (ex: 2023-MERCY-001)
 */
export function useStudentRegistrationNumber({
  schoolId,
  academicYearId,
  schoolPrefix,
}: UseStudentRegistrationNumberProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationNumber, setRegistrationNumber] = useState<string>('');

  /**
   * Génère un nouveau matricule pour un élève
   */
  const generateRegistrationNumber = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Si un préfixe d'école est fourni, l'utiliser, sinon le service en générera un
      const params = { school_id: schoolId, academic_year_id: academicYearId };
      if (schoolPrefix) {
        Object.assign(params, { school_prefix: schoolPrefix });
      }
      
      const response = await studentService.generateRegistrationNumber(params);
      const generatedNumber = response.registration_number;
      setRegistrationNumber(generatedNumber);
      return generatedNumber;
    } catch (err) {
      setError('Erreur lors de la génération du matricule');
      console.error('Erreur de génération de matricule:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, academicYearId, schoolPrefix]);

  /**
   * Vérifie si un matricule existe déjà
   */
  const checkRegistrationNumberExists = useCallback(async (number: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const exists = await studentService.checkRegistrationNumberExists(number);
      return exists;
    } catch (err) {
      setError('Erreur lors de la vérification du matricule');
      console.error('Erreur de vérification de matricule:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Valide le format d'un matricule
   * Format attendu: ANNEE-ECOLE-XXX
   */
  const validateRegistrationNumberFormat = useCallback((number: string): boolean => {
    // Regex pour valider le format ANNEE-ECOLE-XXX
    // ANNEE: 4 chiffres
    // ECOLE: Lettres majuscules
    // XXX: 3 chiffres ou plus
    const regex = /^\d{4}-[A-Z]+-\d{3,}$/;
    return regex.test(number);
  }, []);

  /**
   * Génère un matricule et vérifie qu'il est unique
   */
  const generateUniqueRegistrationNumber = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Essayer jusqu'à 5 fois pour éviter une boucle infinie
      for (let attempt = 0; attempt < 5; attempt++) {
        const params = { school_id: schoolId, academic_year_id: academicYearId };
        if (schoolPrefix) {
          Object.assign(params, { school_prefix: schoolPrefix });
        }
        
        const response = await studentService.generateRegistrationNumber(params);
        const number = response.registration_number;
        const exists = await checkRegistrationNumberExists(number);
        
        if (!exists) {
          setRegistrationNumber(number);
          return number;
        }
      }
      
      throw new Error('Impossible de générer un matricule unique après plusieurs tentatives');
    } catch (err) {
      setError('Erreur lors de la génération du matricule unique');
      console.error('Erreur de génération de matricule unique:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, academicYearId, schoolPrefix, checkRegistrationNumberExists]);

  return {
    registrationNumber,
    isLoading,
    error,
    generateRegistrationNumber,
    checkRegistrationNumberExists,
    validateRegistrationNumberFormat,
    generateUniqueRegistrationNumber,
    setRegistrationNumber,
  };
}