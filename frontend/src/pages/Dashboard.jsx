import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import api from '../api/axios';
import './Dashboard.css';

const Dashboard = () => {
    // État pour stocker la liste des transactions récupérées
    const [transactions, setTransactions] = useState([]);
    const [budget, setBudget] = useState(null); // Budget pour le mois en cours
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // useEffect : s'exécute quand le composant est affiché (monté)
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // APPEL API : on demande les transactions au backend
                const transRes = await api.get('transactions/');
                setTransactions(transRes.data);

                // Récupération du budget du mois en cours
                const now = new Date();
                const budgetRes = await api.get('budgets/');
                const currentBudget = budgetRes.data.find(b => 
                    b.mois === (now.getMonth() + 1) && b.annee === now.getFullYear()
                );
                setBudget(currentBudget);
            } catch (err) {
                console.error("Erreur de récupération :", err);
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    navigate('/login'); // On renvoie l'utilisateur à la page de connexion
                }
            } finally {
                setLoading(false); // On arrête l'affichage du chargement
            }
        };

        fetchDashboardData();
    }, [navigate]);

    // Fonction pour se déconnecter
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    // --- CALCULS DES STATISTIQUES ---
    // filter() : on ne garde que les transactions d'un certain type
    // reduce() : on additionne tous les montants
    const totalRevenus = transactions
        .filter(t => t.type_transaction === 'REVENU')
        .reduce((sum, current) => sum + parseFloat(current.montant), 0);
        
    const totalDepenses = transactions
        .filter(t => t.type_transaction === 'DEPENSE')
        .reduce((sum, current) => sum + parseFloat(current.montant), 0);
        
    const soldeActuel = totalRevenus - totalDepenses;

    // Calcul du pourcentage du budget consommé
    const budgetMontant = budget ? parseFloat(budget.montant) : 0;
    const pourcentageBudget = budgetMontant > 0 ? (totalDepenses / budgetMontant) * 100 : 0;

    if (loading) return <div className="page-container"><p>Chargement du tableau de bord...</p></div>;

    return (
        <div className="dashboard-layout">
            <nav className="sidebar glass-panel animate-slide-in-left">
                <div className="logo-container">
                    <span className="logo-icon-small">💸</span>
                    <h2>Djago</h2>
                    <div className="theme-toggle-nav">
                        <ThemeToggle />
                    </div>
                </div>
                <ul className="nav-links">
                    <li>
                        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                            Tableau de bord
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/transactions" className={({ isActive }) => isActive ? 'active' : ''}>
                            Transactions
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/dettes-factures" className={({ isActive }) => isActive ? 'active' : ''}>
                            Dettes & Factures
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/rapports" className={({ isActive }) => isActive ? 'active' : ''}>
                            Rapports
                        </NavLink>
                    </li>
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

                {/* --- SECTION BUDGET --- */}
                {budget && (
                    <div className="budget-section glass-panel animate-fade-in-up delay-350">
                        <div className="budget-header">
                            <h2>Suivi du Budget ({new Date().toLocaleString('fr-FR', { month: 'long' })})</h2>
                            <span className="budget-ratio">
                                {totalDepenses.toFixed(2)}€ / {budgetMontant.toFixed(2)}€
                            </span>
                        </div>
                        <div className="progress-container">
                            <div 
                                className={`progress-bar ${pourcentageBudget > 100 ? 'danger' : pourcentageBudget > 80 ? 'warning' : ''}`}
                                style={{ width: `${Math.min(pourcentageBudget, 100)}%` }}
                            ></div>
                        </div>
                        <p className="budget-status">
                            {pourcentageBudget > 100 
                                ? `Dépassement de ${(totalDepenses - budgetMontant).toFixed(2)}€ !` 
                                : `Il vous reste ${(budgetMontant - totalDepenses).toFixed(2)}€.`}
                        </p>
                    </div>
                )}

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
