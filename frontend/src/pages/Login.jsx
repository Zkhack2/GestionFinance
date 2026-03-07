import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Login.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', password: '', email: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Login
                const response = await api.post('token/', {
                    username: formData.username,
                    password: formData.password
                });
                
                // Store tokens
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                
                navigate('/dashboard');
            } else {
                // Register
                await api.post('register/', {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                });
                
                // Switch to login mode after successful registration
                setIsLogin(true);
                alert("Compte créé avec succès ! Connectez-vous maintenant.");
            }
        } catch (err) {
            console.error('Auth error', err);
            setError('Identifiants incorrects. Veuillez réessayer.');
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
