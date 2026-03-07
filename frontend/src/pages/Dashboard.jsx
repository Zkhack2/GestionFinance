import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Dashboard.css';

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch transactions
                const res = await api.get('transactions/');
                setTransactions(res.data);
            } catch (err) {
                console.error("Erreur de récupération :", err);
                // Si non autorisé (token expiré ou absent), on redirige vers le login
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    // Calculs rapides
    const totalRevenus = transactions
        .filter(t => t.type_transaction === 'REVENU')
        .reduce((sum, current) => sum + parseFloat(current.montant), 0);
        
    const totalDepenses = transactions
        .filter(t => t.type_transaction === 'DEPENSE')
        .reduce((sum, current) => sum + parseFloat(current.montant), 0);
        
    const soldeActuel = totalRevenus - totalDepenses;

    if (loading) return <div className="page-container"><p>Chargement du tableau de bord...</p></div>;

    return (
        <div className="dashboard-layout">
            <nav className="sidebar glass-panel animate-slide-in-left">
                <div className="logo-container">
                    <span className="logo-icon-small">💸</span>
                    <h2>Djago</h2>
                </div>
                <ul className="nav-links">
                    <li className="active"><a href="/dashboard">Tableau de bord</a></li>
                    <li><a href="/transactions">Transactions</a></li>
                    <li><a href="/dettes-factures">Dettes & Factures</a></li>
                    <li><a href="/rapports">Rapports</a></li>
                </ul>
            </nav>
            <div className="sidebar-footer">
                <button onClick={handleLogout} className="btn btn-secondary btn-block">
                    <span style={{marginRight: '0.5rem'}}>🚪</span> Déconnexion
                </button>
            </div>


            <main className="dashboard-content page-container">
                <header className="dashboard-header animate-fade-in-up">
                    <h1 className="title">Aperçu financier</h1>
                    <div className="date-display">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card glass-panel animate-scale-in delay-100">
                        <h3>Solde Actuel</h3>
                        <p className={`stat-value ${soldeActuel >= 0 ? 'positive' : 'negative'}`}>
                            {soldeActuel.toFixed(2)} €
                        </p>
                    </div>
                    <div className="stat-card glass-panel animate-scale-in delay-200">
                        <h3>Revenus (Mois)</h3>
                        <p className="stat-value positive">+{totalRevenus.toFixed(2)} €</p>
                    </div>
                    <div className="stat-card glass-panel animate-scale-in delay-300">
                        <h3>Dépenses (Mois)</h3>
                        <p className="stat-value negative">-{totalDepenses.toFixed(2)} €</p>
                    </div>
                </div>

                <div className="recent-transactions glass-panel animate-fade-in-up delay-400">
                    <div className="section-header">
                        <h2>Dernières Transactions</h2>
                        <button className="btn btn-secondary" onClick={() => navigate('/transactions')}>Voir tout</button>
                    </div>
                    
                    {transactions.length === 0 ? (
                        <p className="empty-state">Aucune transaction pour le moment.</p>
                    ) : (
                        <ul className="transaction-list">
                            {transactions.slice(0, 5).map((transaction, index) => (
                                <li key={transaction.id} className={`transaction-item animate-fade-in-up`} style={{animationDelay: `${400 + index * 100}ms`}}>
                                    <div className="transaction-info">
                                        <span className="transaction-desc">{transaction.description}</span>
                                        <span className="transaction-date">{new Date(transaction.date_creation).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                    <div className={`transaction-amount ${transaction.type_transaction === 'REVENU' ? 'positive' : 'negative'}`}>
                                        {transaction.type_transaction === 'REVENU' ? '+' : '-'}{parseFloat(transaction.montant).toFixed(2)} €
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
