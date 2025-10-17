import axios from 'axios';

// Définir l'URL de base de l'API
export const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Créer une instance axios avec la configuration de base
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification et le contexte d'école à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ajouter l'ID de l'école courante si disponible (nécessaire pour req.schoolId côté backend)
    try {
      const authRaw = localStorage.getItem('schoolAuth');
      if (authRaw) {
        const auth = JSON.parse(authRaw);
        const schoolId = auth?.currentSchool?.id || auth?.currentSchool?._id;
        if (schoolId) {
          (config.headers as any)['X-School-Id'] = schoolId;
        }
      }
    } catch {}
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gérer les erreurs d'authentification (401)
    if (error.response && error.response.status === 401) {
      // Rediriger vers la page de connexion si le token est expiré ou invalide
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;