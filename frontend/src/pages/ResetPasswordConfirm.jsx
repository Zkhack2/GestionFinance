import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import './Login.css';

const ResetPasswordConfirm = () => {
    const { uid, token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);

        try {
            // Django expects a POST to this URL for confirmation
            // We use the same format as Django's PasswordResetConfirmView but adapted for API if needed
            // Currently, we'll try to post to the backend URL
            // Note: Django's built-in view might need specific form data
            const formData = new FormData();
            formData.append('new_password1', password);
            formData.append('new_password2', confirmPassword);

            await api.post(`reset/${uid}/${token}/`, formData);
            
            setMessage('Votre mot de passe a été réinitialisé avec succès !');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            console.error('Reset confirm error', err);
            setError('Le lien est invalide ou a expiré. Veuillez refaire une demande.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container glass-panel animate-scale-in">
                <div className="login-header animate-fade-in-up">
                    <div className="logo-icon">🛡️</div>
                    <h2 className="title">Nouveau mot de passe</h2>
                    <p className="subtitle">Choisissez un mot de passe fort pour sécuriser votre compte.</p>
                </div>

                {message && <div className="success-message" style={{ color: 'var(--secondary)', textAlign: 'center', marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>{message}</div>}
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label htmlFor="password">Nouveau mot de passe</label>
                        <input
                            type="password"
                            id="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="confirmPassword">Confirmez le mot de passe</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="input-field"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-block" disabled={loading || message}>
                        {loading ? 'Réinitialisation...' : 'Changer le mot de passe'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordConfirm;
