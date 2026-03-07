import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Login.css';

const Login = () => {
    // États (States) : permettent de stocker des données qui peuvent changer
    const [isLogin, setIsLogin] = useState(true); // Est-on en mode Connexion ou Inscription ?
    const [formData, setFormData] = useState({ username: '', password: '', email: '' }); // Données du formulaire
    const [error, setError] = useState(''); // Message d'erreur
    const [loading, setLoading] = useState(false); // État de chargement (attente serveur)
    const navigate = useNavigate();

    // Met à jour l'état quand l'utilisateur tape dans un champ
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Fonction exécutée quand on valide le formulaire
    const handleSubmit = async (e) => {
        e.preventDefault(); // Empêche le rechargement de la page
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // APPEL API POUR SE CONNECTER
                const response = await api.post('token/', {
                    username: formData.username,
                    password: formData.password
                });
                
                // On stocke les jetons (Tokens) dans le navigateur (LocalStorage)
                // pour que l'utilisateur reste connecté même s'il ferme l'onglet
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                
                // Redirection vers le tableau de bord
                navigate('/dashboard');
            } else {
                // APPEL API POUR S'INSCRIRE
                await api.post('register/', {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                });
                
                // On repasse en mode connexion après l'inscription
                setIsLogin(true);
                alert("Compte créé avec succès ! Connectez-vous maintenant.");
            }
        } catch (err) {
            console.error('Auth error', err);
            if (!err.response) {
                setError('Le serveur est inaccessible. Vérifiez qu\'il est bien lancé.');
            } else if (err.response.status === 401) {
                setError('Identifiants incorrects.');
            } else {
                setError('Une erreur est survenue lors de l\'authentification.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container glass-panel animate-scale-in">
                <div className="login-header animate-fade-in-up delay-100">
                    <div className="logo-icon">💸</div>
                    <h2 className="title">{isLogin ? 'Bon retour' : 'Créer un compte'}</h2>
                    <p className="subtitle">
                        {isLogin ? 'Gérez vos finances en toute simplicité.' : 'Rejoignez-nous pour prendre en main votre budget.'}
                    </p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label htmlFor="username">Nom d'utilisateur</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="input-field"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="input-field"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="input-field"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        {isLogin && (
                            <div className="forgot-password-link">
                                <button 
                                    type="button" 
                                    className="link-btn"
                                    onClick={() => navigate('/forgot-password')}
                                >
                                    Mot de passe oublié ?
                                </button>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-block" disabled={loading}>
                        {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
                        <button 
                            type="button" 
                            className="toggle-btn"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                        >
                            {isLogin ? "S'inscrire" : "Se connecter"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
