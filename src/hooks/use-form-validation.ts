import { useState, useCallback } from 'react';

type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  isEmail?: boolean;
  isPhone?: boolean;
  isUrl?: boolean;
  custom?: (value: any) => boolean;
  message?: string;
};

type ValidationRules = {
  [key: string]: ValidationRule;
};

type FormErrors = {
  [key: string]: string;
};

interface UseFormValidationReturn {
  errors: FormErrors;
  validateField: (name: string, value: any) => boolean;
  validateForm: (formData: Record<string, any>) => boolean;
  clearErrors: () => void;
  clearError: (name: string) => void;
}

/**
 * Hook personnalisé pour la validation de formulaire
 */
export function useFormValidation(
  validationRules: ValidationRules
): UseFormValidationReturn {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = useCallback(
    (name: string, value: any): boolean => {
      const rules = validationRules[name];
      if (!rules) return true;

      // Vérifier si le champ est requis
      if (rules.required && (!value || value.toString().trim() === '')) {
        setErrors((prev) => ({
          ...prev,
          [name]: rules.message || 'Ce champ est requis',
        }));
        return false;
      }

      // Vérifier la longueur minimale
      if (
        rules.minLength &&
        value &&
        value.toString().length < rules.minLength
      ) {
        setErrors((prev) => ({
          ...prev,
          [name]:
            rules.message ||
            `Ce champ doit contenir au moins ${rules.minLength} caractères`,
        }));
        return false;
      }

      // Vérifier la longueur maximale
      if (
        rules.maxLength &&
        value &&
        value.toString().length > rules.maxLength
      ) {
        setErrors((prev) => ({
          ...prev,
          [name]:
            rules.message ||
            `Ce champ ne doit pas dépasser ${rules.maxLength} caractères`,
        }));
        return false;
      }

      // Vérifier le pattern
      if (rules.pattern && value && !rules.pattern.test(value.toString())) {
        setErrors((prev) => ({
          ...prev,
          [name]: rules.message || 'Format invalide',
        }));
        return false;
      }

      // Vérifier si c'est un email valide
      if (rules.isEmail && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.toString())) {
          setErrors((prev) => ({
            ...prev,
            [name]: rules.message || 'Adresse email invalide',
          }));
          return false;
        }
      }

      // Vérifier si c'est un numéro de téléphone valide
      if (rules.isPhone && value) {
        const phoneRegex = /^\+?[0-9]{8,15}$/;
        if (!phoneRegex.test(value.toString().replace(/\s/g, ''))) {
          setErrors((prev) => ({
            ...prev,
            [name]: rules.message || 'Numéro de téléphone invalide',
          }));
          return false;
        }
      }

      // Vérifier si c'est une URL valide
      if (rules.isUrl && value) {
        try {
          new URL(value.toString());
        } catch (e) {
          setErrors((prev) => ({
            ...prev,
            [name]: rules.message || 'URL invalide',
          }));
          return false;
        }
      }

      // Validation personnalisée
      if (rules.custom && value && !rules.custom(value)) {
        setErrors((prev) => ({
          ...prev,
          [name]: rules.message || 'Valeur invalide',
        }));
        return false;
      }

      // Si toutes les validations passent, supprimer l'erreur pour ce champ
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });

      return true;
    },
    [validationRules]
  );

  const validateForm = useCallback(
    (formData: Record<string, any>): boolean => {
      let isValid = true;

      // Réinitialiser les erreurs
      setErrors({});

      // Valider chaque champ
      Object.keys(validationRules).forEach((fieldName) => {
        const isFieldValid = validateField(fieldName, formData[fieldName]);
        if (!isFieldValid) {
          isValid = false;
        }
      });

      return isValid;
    },
    [validateField, validationRules]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearError = useCallback((name: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    clearError,
  };
}