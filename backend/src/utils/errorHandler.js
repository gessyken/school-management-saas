import { logAction } from './logAction.js';

/**
 * Gestionnaire d'erreurs centralisé avec logging
 * @param {Error} error - L'erreur à traiter
 * @param {Object} context - Contexte de l'erreur
 * @param {String} context.module - Module où l'erreur s'est produite
 * @param {String} context.school - ID de l'école
 * @param {String} [context.user] - ID de l'utilisateur (optionnel)
 * @returns {Object} Erreur formatée pour la réponse API
 */
export const handleError = async (error, context) => {
  let errorCode = 'SYS_001'; // Par défaut: erreur système interne
  let publicMessage = 'Une erreur est survenue';

  // Déterminer le type d'erreur et le code approprié
  if (error.name === 'ValidationError') {
    errorCode = 'DATA_001';
    publicMessage = 'Données invalides';
  } else if (error.name === 'CastError') {
    errorCode = 'DATA_001';
    publicMessage = 'Format de données incorrect';
  } else if (error.message.includes('duplicate key')) {
    errorCode = 'DATA_003';
    publicMessage = 'Cette ressource existe déjà';
  } else if (error.name === 'JsonWebTokenError') {
    errorCode = 'AUTH_002';
    publicMessage = 'Token invalide';
  } else if (error.name === 'TokenExpiredError') {
    errorCode = 'AUTH_002';
    publicMessage = 'Session expirée';
  } else if (error.message.includes('permission')) {
    errorCode = 'AUTH_003';
    publicMessage = 'Accès non autorisé';
  }

  // Logger l'erreur
  await logAction({
    action: 'ERROR',
    module: context.module,
    description: publicMessage,
    user: context.user,
    school: context.school,
    errorCode,
    errorDetails: {
      message: error.message,
      stackTrace: error.stack,
      originalError: error
    }
  });

  // Retourner une réponse formatée
  return {
    success: false,
    error: {
      code: errorCode,
      message: publicMessage
    }
  };
};

/**
 * Middleware pour la gestion des erreurs Express
 */
export const errorMiddleware = (err, req, res, next) => {
  handleError(err, {
    module: req.originalUrl.split('/')[1] || 'System',
    user: req.user?._id,
    school: req.schoolId
  }).then(errorResponse => {
    res.status(getHttpStatusFromErrorCode(errorResponse.error.code))
       .json(errorResponse);
  }).catch(error => {
    // Fallback en cas d'erreur pendant le traitement de l'erreur
    console.error('Erreur critique pendant le traitement de l\'erreur:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SYS_001',
        message: 'Erreur système critique'
      }
    });
  });
};

/**
 * Convertit un code d'erreur en code HTTP approprié
 */
const getHttpStatusFromErrorCode = (errorCode) => {
  const statusMap = {
    'AUTH_001': 401, // Non authentifié
    'AUTH_002': 401, // Token invalide
    'AUTH_003': 403, // Non autorisé
    'DATA_001': 400, // Requête invalide
    'DATA_002': 404, // Non trouvé
    'DATA_003': 409, // Conflit
    'SYS_001': 500, // Erreur serveur
    'SYS_002': 503, // Service indisponible
    'SYS_003': 429, // Trop de requêtes
    'BUS_001': 422, // Erreur métier
    'BUS_002': 403, // Non autorisé (règle métier)
    'BUS_003': 422  // État invalide
  };
  return statusMap[errorCode] || 500;
};