import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            // APPEL API : demande d'envoi d'un email de réinitialisation
            // Django utilise ses vues par défaut pour envoyer l'email (en console ici)
            await api.post('password_reset/', { email });
            setMessage('Si cet email est enregistré, vous recevrez un lien de réinitialisation prochainement.');
        } catch (err) {
            console.error('Reset error', err);
            setError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container glass-panel animate-scale-in">
                <div className="login-header animate-fade-in-up">
                    <div className="logo-icon">🔑</div>
                    <h2 className="title">Réinitialiser</h2>
                    <p className="subtitle">Saisissez votre email pour recevoir un lien de récupération.</p>
                </div>

                {message && <div className="success-message" style={{ color: 'var(--secondary)', textAlign: 'center', marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>{message}</div>}
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-block" disabled={loading || message}>
                        {loading ? 'Envoi...' : 'Envoyer le lien'}
                    </button>
                </form>

                <div className="login-footer">
                    <button className="toggle-btn" onClick={() => navigate('/login')}>Retour à la connexion</button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
