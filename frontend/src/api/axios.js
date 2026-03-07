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

export default api;
