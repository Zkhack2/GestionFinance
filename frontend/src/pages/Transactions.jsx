import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Transactions.css';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // État pour afficher ou cacher le formulaire d'ajout
    const [showForm, setShowForm] = useState(false);
    
    // État pour les données du nouveau formulaire
    const [formData, setFormData] = useState({
        montant: '',
        type_transaction: 'DEPENSE',
        description: ''
    });

    const navigate = useNavigate();

    // Fonction réutilisable pour récupérer la liste mise à jour
    const fetchTransactions = async () => {
        try {
            const res = await api.get('transactions/');
            setTransactions(res.data);
        } catch (err) {
            console.error("Erreur :", err);
            if (err.response && err.response.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    // Au chargement de la page, on récupère les données
    useEffect(() => {
        fetchTransactions();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Fonction pour envoyer les données du formulaire au backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // APPEL API POST : on envoie l'objet formData
            await api.post('transactions/', formData);
            setShowForm(false); // On cache le formulaire après succès
            setFormData({ montant: '', type_transaction: 'DEPENSE', description: '' }); // On vide les champs
            fetchTransactions(); // On recharge la liste pour voir la nouvelle transaction
        } catch (err) {
            console.error("Erreur lors de l'ajout", err);
            alert("Une erreur est survenue lors de l'ajout de la transaction.");
        }
    };

    // Fonction pour supprimer une transaction
    const handleDelete = async (id) => {
        // Demande une confirmation à l'utilisateur avant de supprimer
        if(window.confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")) {
            try {
                // APPEL API DELETE : on précise l'ID de la transaction dans l'URL
                await api.delete(`transactions/${id}/`);
                fetchTransactions(); // On rafraîchit la liste
            } catch (err) {
                console.error("Erreur lors de la suppression", err);
                alert("Erreur lors de la suppression.");
            }
        }
    };

    if (loading) return <div className="page-container"><p>Chargement des transactions...</p></div>;

    return (
        <div className="dashboard-layout">
            {/* Same Sidebar as Dashboard (in a real app, this should be a reusable component) */}
            <nav className="sidebar glass-panel animate-slide-in-left">
                <div className="logo-container">
                    <span className="logo-icon-small">💸</span>
                    <h2>Djago</h2>
                </div>
                <ul className="nav-links">
                    <li><a href="/dashboard">Tableau de bord</a></li>
                    <li className="active"><a href="/transactions">Transactions</a></li>
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
                <header className="dashboard-header flex-header animate-fade-in-up">
                    <h1 className="title">Historique des transactions</h1>
                    <button 
                        className="btn animate-scale-in delay-100" 
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Annuler' : '+ Nouvelle Transaction'}
                    </button>
                </header>

                {showForm && (
                    <div className="transaction-form-card glass-panel fade-in">
                        <h3>Ajouter une transaction</h3>
                        <form onSubmit={handleSubmit} className="t-form">
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Description</label>
                                    <input 
                                        type="text" 
                                        name="description"
                                        className="input-field" 
                                        value={formData.description}
                                        onChange={handleChange}
                                        required 
                                        placeholder="Ex: Courses au supermarché"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Montant (€)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        min="0.01"
                                        name="montant"
                                        className="input-field" 
                                        value={formData.montant}
                                        onChange={handleChange}
                                        required 
                                        placeholder="Ex: 45.50"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Type</label>
                                    <select 
                                        name="type_transaction" 
                                        className="input-field"
                                        value={formData.type_transaction}
                                        onChange={handleChange}
                                    >
                                        <option value="DEPENSE">Dépense (-)</option>
                                        <option value="REVENU">Revenu (+)</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="btn">Enregistrer</button>
                        </form>
                    </div>
                )}

                <div className="glass-panel main-table-container animate-fade-in-up delay-200">
                    {transactions.length === 0 ? (
                        <p className="empty-state">Vous n'avez pas encore de transactions.</p>
                    ) : (
                        <table className="transactions-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Type</th>
                                    <th className="amount-col">Montant</th>
                                    <th className="action-col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((t, index) => (
                                    <tr key={t.id} className="animate-fade-in-up" style={{animationDelay: `${300 + Math.min(index * 50, 1000)}ms`}}>
                                        <td>{new Date(t.date_creation).toLocaleDateString('fr-FR')}</td>
                                        <td className="desc-cell">{t.description}</td>
                                        <td>
                                            <span className={`badge ${t.type_transaction === 'REVENU' ? 'badge-success' : 'badge-danger'}`}>
                                                {t.type_transaction === 'REVENU' ? 'Revenu' : 'Dépense'}
                                            </span>
                                        </td>
                                        <td className={`amount-col ${t.type_transaction === 'REVENU' ? 'positive' : 'negative'}`}>
                                            {t.type_transaction === 'REVENU' ? '+' : '-'}{parseFloat(t.montant).toFixed(2)} €
                                        </td>
                                        <td className="action-col">
                                            <button 
                                                className="delete-btn"
                                                onClick={() => handleDelete(t.id)}
                                                title="Supprimer"
                                            >
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Transactions;
