import axios from 'axios';

// On crée une instance "api" personnalisée d'Axios
const api = axios.create({
    // L'adresse de base de notre serveur Django (backend)
    baseURL: 'http://localhost:8000/api/',
});

// Un "intercepteur" qui s'exécute AUTOMATIQUEMENT avant chaque requête
api.interceptors.request.use(
    (config) => {
        // On récupère le jeton (token) de connexion stocké dans le navigateur
        const token = localStorage.getItem('access_token');
        if (token) {
            // Si on a un token, on l'ajoute dans l'en-tête (Header) de la requête
            // Cela permet au backend de savoir QUI fait la requête
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs 401 (token expiré ou invalide)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si on reçoit un 401 et que la requête n'est pas déjà une tentative de refresh
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('token/')
        ) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                // Pas de refresh token -> déconnexion
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const response = await api.post('token/refresh/', {
                    refresh: refreshToken,
                });

                localStorage.setItem('access_token', response.data.access);

                // On met à jour l'en-tête et relance la requête initiale
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Si le refresh échoue, on redirige vers la connexion
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
