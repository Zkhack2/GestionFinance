import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import api from '../api/axios';
import './Transactions.css'; // Reusing transaction styles for the table

const DettesFactures = () => {
    const [dettes, setDettes] = useState([]);
    const [factures, setFactures] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal de confirmation (pour changer le statut)
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        type: null, // 'dette' | 'facture'
        item: null,
    });


    // Formulaires pour ajouter des dettes ou factures
    const [showDetteForm, setShowDetteForm] = useState(false);
    const [detteData, setDetteData] = useState({
        creancier_ou_debiteur: '',
        montant: '',
        description: '',
        date_emprunt: new Date().toISOString().split('T')[0], // Date du jour par défaut
        date_echeance: '',
        est_rembourse: false
    });

    const navigate = useNavigate();

    // Récupération globale des données
    const fetchData = useCallback(async () => {
        try {
            // Promise.all permet de lancer les deux requêtes en même temps
            const [resDettes, resFactures] = await Promise.all([
                api.get('dettes/'),
                api.get('factures/')
            ]);
            setDettes(resDettes.data);
            setFactures(resFactures.data);
        } catch (err) {
            console.error("Erreur :", err);
            if (err.response && err.response.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Generic form handler
    const handleDetteChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setDetteData({ ...detteData, [e.target.name]: value });
    };

    const handleAddDette = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = { ...detteData };
            if (!dataToSubmit.date_echeance) {
                delete dataToSubmit.date_echeance;
            }
            await api.post('dettes/', dataToSubmit);
            setShowDetteForm(false);
            setDetteData({
                creancier_ou_debiteur: '', montant: '', description: '',
                date_emprunt: new Date().toISOString().split('T')[0], date_echeance: '', est_rembourse: false
            });
            fetchData();
        } catch (err) {
            console.error("Erreur", err);
            alert("Erreur lors de l'ajout de la dette.");
        }
    };

    const toggleDetteStatus = async (dette) => {
        try {
            await api.patch(`dettes/${dette.id}/`, { est_rembourse: !dette.est_rembourse });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const toggleFactureStatus = async (facture) => {
        try {
            await api.patch(`factures/${facture.id}/`, { est_payee: !facture.est_payee });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const openConfirmModal = (type, item) => {
        setConfirmModal({ open: true, type, item });
    };

    const closeConfirmModal = () => {
        setConfirmModal({ open: false, type: null, item: null });
    };

    const confirmToggleStatus = async () => {
        if (!confirmModal.item || !confirmModal.type) return;

        if (confirmModal.type === 'dette') {
            await toggleDetteStatus(confirmModal.item);
        } else if (confirmModal.type === 'facture') {
            await toggleFactureStatus(confirmModal.item);
        }

        closeConfirmModal();
    };

    const isOverdue = (dateString, isResolved) => {
        if (!dateString || isResolved) return false;
        const echeance = new Date(dateString);
        const today = new Date();
        today.setHours(0,0,0,0);
        return echeance < today;
    };

    // Factures state
    const [showFactureForm, setShowFactureForm] = useState(false);
    const [factureData, setFactureData] = useState({
        titre: '',
        montant: '',
        date_emission: new Date().toISOString().split('T')[0],
        date_echeance: '',
        est_payee: false
    });

    const handleFactureChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFactureData({ ...factureData, [e.target.name]: value });
    };

    const handleAddFacture = async (e) => {
        e.preventDefault();
        try {
            await api.post('factures/', factureData);
            setShowFactureForm(false);
            setFactureData({
                titre: '', montant: '',
                date_emission: new Date().toISOString().split('T')[0], date_echeance: '', est_payee: false
            });
            fetchData();
        } catch (err) {
            console.error("Erreur facture", err);
            alert("Erreur lors de l'ajout de la facture.");
        }
    };

    if (loading) return <div className="page-container"><p>Chargement...</p></div>;

    return (
        <SidebarLayout>
            <header className="dashboard-header flex-header animate-fade-in-up">
                <h1 className="title">Gestion des Dettes</h1>
                <button 
                    className="btn animate-scale-in delay-100" 
                    onClick={() => setShowDetteForm(!showDetteForm)}
                >
                    {showDetteForm ? 'Annuler' : '+ Nouvelle Dette'}
                </button>
            </header>

                {showDetteForm && (
                    <div className="transaction-form-card glass-panel fade-in">
                        <h3>Ajouter une dette ou une créance</h3>
                        <form onSubmit={handleAddDette} className="t-form">
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Personne / Organisme</label>
                                    <input type="text" name="creancier_ou_debiteur" className="input-field" value={detteData.creancier_ou_debiteur} onChange={handleDetteChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Montant (€)</label>
                                    <input type="number" step="0.01" min="0.01" name="montant" className="input-field" value={detteData.montant} onChange={handleDetteChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Date d'emprunt</label>
                                    <input type="date" name="date_emprunt" className="input-field" value={detteData.date_emprunt} onChange={handleDetteChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Date d'échéance (Optionnel)</label>
                                    <input type="date" name="date_echeance" className="input-field" value={detteData.date_echeance} onChange={handleDetteChange} />
                                </div>
                            </div>
                            <button type="submit" className="btn" style={{marginTop: '1rem'}}>Enregistrer</button>
                        </form>
                    </div>
                )}

                <div className="glass-panel main-table-container animate-fade-in-up delay-200" style={{marginBottom: '3rem'}}>
                    {dettes.length === 0 ? (
                        <p className="empty-state">Aucune dette enregistrée.</p>
                    ) : (
                        <table className="transactions-table">
                            <thead>
                                <tr>
                                    <th>Tiers</th>
                                    <th>Montant</th>
                                    <th>Échéance</th>
                                    <th>Statut (cliquer pour changer)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dettes.map((d, index) => {
                                    const enRetard = isOverdue(d.date_echeance, d.est_rembourse);
                                    let rowClass = animateBg(d.est_rembourse);
                                    if (enRetard) rowClass += ' row-danger';
                                    return (
                                        <tr key={d.id} className={`${rowClass} animate-fade-in-up`} style={{animationDelay: `${300 + Math.min(index * 50, 1000)}ms`}}>
                                            <td className="desc-cell">{d.creancier_ou_debiteur}</td>
                                            <td className="amount-col">{parseFloat(d.montant).toFixed(2)} €</td>
                                            <td className={enRetard ? 'text-danger fw-bold' : ''}>
                                                {d.date_echeance ? new Date(d.date_echeance).toLocaleDateString('fr-FR') : 'Non défini'}
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge clickable ${d.est_rembourse ? 'badge-success' : (enRetard ? 'badge-danger' : 'badge-warning')}`}
                                                    onClick={() => toggleDetteStatus(d)}
                                                    title="Cliquer pour basculer le statut"
                                                >
                                                    {d.est_rembourse ? 'Remboursé' : (enRetard ? 'En retard !' : 'En cours')}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                <header className="dashboard-header flex-header animate-fade-in-up delay-300" style={{marginTop: '2rem'}}>
                    <h1 className="title">Factures à venir</h1>
                    <button 
                        className="btn animate-scale-in delay-400" 
                        onClick={() => setShowFactureForm(!showFactureForm)}
                    >
                        {showFactureForm ? 'Annuler' : '+ Nouvelle Facture'}
                    </button>
                </header>
                
                {showFactureForm && (
                    <div className="transaction-form-card glass-panel fade-in">
                        <h3>Ajouter une facture</h3>
                        <form onSubmit={handleAddFacture} className="t-form">
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Titre de la facture</label>
                                    <input type="text" name="titre" className="input-field" value={factureData.titre} onChange={handleFactureChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Montant (€)</label>
                                    <input type="number" step="0.01" min="0.01" name="montant" className="input-field" value={factureData.montant} onChange={handleFactureChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Date d'émission</label>
                                    <input type="date" name="date_emission" className="input-field" value={factureData.date_emission} onChange={handleFactureChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Date d'échéance</label>
                                    <input type="date" name="date_echeance" className="input-field" value={factureData.date_echeance} onChange={handleFactureChange} required />
                                </div>
                            </div>
                            <button type="submit" className="btn" style={{marginTop: '1rem'}}>Enregistrer</button>
                        </form>
                    </div>
                )}
                
                <div className="glass-panel main-table-container animate-fade-in-up delay-400">
                    {factures.length === 0 ? (
                        <p className="empty-state">Aucune facture enregistrée.</p>
                    ) : (
                        <table className="transactions-table">
                            <thead>
                                <tr>
                                    <th>Titre</th>
                                    <th>Montant</th>
                                    <th>Échéance</th>
                                    <th>Statut (cliquer pour changer)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {factures.map((f, index) => {
                                    const enRetard = isOverdue(f.date_echeance, f.est_payee);
                                    let rowClass = animateBg(f.est_payee);
                                    if (enRetard) rowClass += ' row-danger';
                                    return (
                                    <tr key={f.id} className={`${rowClass} animate-fade-in-up`} style={{animationDelay: `${500 + Math.min(index * 50, 1000)}ms`}}>
                                        <td className="desc-cell">{f.titre}</td>
                                        <td className="amount-col">{parseFloat(f.montant).toFixed(2)} €</td>
                                        <td className={enRetard ? 'text-danger fw-bold' : ''}>
                                            {new Date(f.date_echeance).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className={`badge clickable ${f.est_payee ? 'badge-success' : (enRetard ? 'badge-danger' : 'badge-warning')}`}
                                                onClick={() => openConfirmModal('facture', f)}
                                                title="Cliquer pour changer le statut"
                                            >
                                                {f.est_payee ? 'Payée' : (enRetard ? 'En retard !' : 'En attente')}
                                            </button>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

            {confirmModal.open && (
                <div className="modal-overlay" onClick={closeConfirmModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Confirmer l'action</h3>
                        <p>
                            Voulez-vous vraiment {confirmModal.type === 'dette' ? 'changer le statut de cette dette' : 'changer le statut de cette facture'} ?
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={closeConfirmModal}>
                                Annuler
                            </button>
                            <button className="btn" onClick={confirmToggleStatus}>
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </SidebarLayout>
    );
};

// CSS helper
const animateBg = (isResolved) => isResolved ? 'row-resolved' : '';

export default DettesFactures;
