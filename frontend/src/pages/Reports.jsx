import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { 
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    LineChart, Line
} from 'recharts';
import api from '../api/axios';
import './Reports.css';

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'];

const Reports = () => {
    const [transactions, setTransactions] = useState([]);
    const [dettes, setDettes] = useState([]);
    const [factures, setFactures] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // useEffect s'exécute au montage du composant
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // On récupère TOUTES les données en parallèle (plus rapide)
                const [resTrans, resDettes, resFactures] = await Promise.all([
                    api.get('transactions/'),
                    api.get('dettes/'),
                    api.get('factures/')
                ]);
                // On met à jour nos états locaux
                setTransactions(resTrans.data);
                setDettes(resDettes.data);
                setFactures(resFactures.data);
            } catch (err) {
                // Si erreur 401 (token expiré), redirection vers login
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    // Fonction pour télécharger l'export CSV
    const handleExportCSV = async () => {
        try {
            // On demande le fichier au backend (responseType blob pour un fichier binaire)
            const response = await api.get('export-csv/', { responseType: 'blob' });
            
            // Création d'un lien temporaire pour le téléchargement
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'transactions.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Erreur d'export :", err);
            alert("Impossible de générer l'export CSV.");
        }
    };

    // Calculate chart data
    const totalRevenus = transactions
        .filter(t => t.type_transaction === 'REVENU')
        .reduce((sum, current) => sum + parseFloat(current.montant), 0);
        
    const totalDepenses = transactions
        .filter(t => t.type_transaction === 'DEPENSE')
        .reduce((sum, current) => sum + parseFloat(current.montant), 0);

    const pieData = [
        { name: 'Revenus', value: totalRevenus },
        { name: 'Dépenses', value: totalDepenses },
    ];

    // Group expenses by description (mock grouping logic for a simple bar chart)
    const groupedExpenses = transactions
        .filter(t => t.type_transaction === 'DEPENSE')
        .reduce((acc, curr) => {
            // Very simplified categorization logic taking first word
            const cat = curr.description.split(' ')[0] || 'Autre';
            acc[cat] = (acc[cat] || 0) + parseFloat(curr.montant);
            return acc;
        }, {});

    const barData = Object.keys(groupedExpenses).map(key => ({
        name: key,
        montant: groupedExpenses[key]
    })).sort((a,b) => b.montant - a.montant).slice(0, 5); // top 5 expenses

    // --- LOGIQUE DU GRAPHIQUE LINÉAIRE (Évolution du solde) ---
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date_creation) - new Date(b.date_creation));
    let runningBalance = 0;
    const lineData = sortedTransactions.map(t => {
        const amt = parseFloat(t.montant);
        runningBalance += (t.type_transaction === 'REVENU' ? amt : -amt);
        return {
            date: new Date(t.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
            solde: runningBalance
        };
    }).slice(-10); // On garde les 10 derniers points pour la clarté

    // --- LOGIQUE DES ALERTES ---
    // Cette fonction calcule les factures/dettes en retard ou proches du terme
    const computeAlerts = () => {
        const alertsList = [];
        const today = new Date();
        today.setHours(0,0,0,0);
        
        // On définit une période de 7 jours pour les alertes "à venir"
        const inSevenDays = new Date(today);
        inSevenDays.setDate(today.getDate() + 7);

        // Analyse des factures
        factures.forEach(f => {
            if (!f.est_payee && f.date_echeance) {
                const echeance = new Date(f.date_echeance);
                if (echeance < today) {
                    // ALERTE ROUGE : déjà en retard
                    alertsList.push({ id: `f-${f.id}`, type: 'danger', title: 'Facture en retard', desc: `${f.titre} - ${f.montant}€`, date: f.date_echeance, link: '/dettes-factures' });
                } else if (echeance <= inSevenDays) {
                    // ALERTE ORANGE : arrive bientôt
                    alertsList.push({ id: `f-${f.id}`, type: 'warning', title: 'Facture à venir', desc: `${f.titre} - ${f.montant}€`, date: f.date_echeance, link: '/dettes-factures' });
                }
            }
        });

        // Analyse des dettes (même logique)
        dettes.forEach(d => {
            if (!d.est_rembourse && d.date_echeance) {
                const echeance = new Date(d.date_echeance);
                if (echeance < today) {
                    alertsList.push({ id: `d-${d.id}`, type: 'danger', title: 'Dette en retard', desc: `Remboursement à ${d.creancier_ou_debiteur} - ${d.montant}€`, date: d.date_echeance, link: '/dettes-factures' });
                } else if (echeance <= inSevenDays) {
                    alertsList.push({ id: `d-${d.id}`, type: 'warning', title: 'Dette à venir', desc: `Remboursement à ${d.creancier_ou_debiteur} - ${d.montant}€`, date: d.date_echeance, link: '/dettes-factures' });
                }
            }
        });

        // On trie les alertes : les plus anciennes (retards) en premier
        return alertsList.sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    const alerts = computeAlerts();

    if (loading) return <div className="page-container"><p>Chargement des rapports...</p></div>;

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
                    <div>
                        <h1 className="title">Analyses et Statistiques</h1>
                        <p className="subtitle">Visualisez la répartition de votre budget</p>
                    </div>
                    <button className="btn btn-secondary" onClick={handleExportCSV}>
                        📥 Exporter CSV
                    </button>
                </header>

                <div className="charts-grid">
                    <div className="glass-panel chart-card animate-scale-in delay-100">
                        <h3>Dépenses vs Revenus</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value.toFixed(2)} €`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-panel chart-card animate-scale-in delay-200">
                        <h3>Top 5 Catégories de Dépenses</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="name" stroke="#94A3B8" />
                                    <YAxis stroke="#94A3B8" />
                                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} formatter={(value) => `${value.toFixed(2)} €`} />
                                    <Bar dataKey="montant" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-panel chart-card full-width animate-scale-in delay-250">
                        <h3>Évolution du Solde</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={lineData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" stroke="#94A3B8" />
                                    <YAxis stroke="#94A3B8" />
                                    <Tooltip formatter={(value) => `${value.toFixed(2)} €`} />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="solde" 
                                        stroke="var(--secondary)" 
                                        strokeWidth={3} 
                                        dot={{ fill: 'var(--secondary)', r: 4 }}
                                        activeDot={{ r: 6 }} 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Alerts Section */}
                {alerts.length > 0 && (
                    <div className="glass-panel alerts-section animate-fade-in-up delay-300">
                        <h3>⚠️ Alertes et Rappels</h3>
                        <div className="alerts-list">
                            {alerts.map(alert => (
                                <div key={alert.id} className={`alert-item ${alert.type}`}>
                                    <div className="alert-icon">
                                        {alert.type === 'danger' ? '🔴' : '🟠'}
                                    </div>
                                    <div className="alert-content">
                                        <div className="alert-title">{alert.title}</div>
                                        <div className="alert-desc">{alert.desc} (Échéance: {new Date(alert.date).toLocaleDateString('fr-FR')})</div>
                                    </div>
                                    <div className="alert-action">
                                        <button className="btn btn-secondary" onClick={() => navigate(alert.link)}>
                                            Gérer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="glass-panel summary-stats animate-fade-in-up delay-400">
                    <h3>Résumé Global</h3>
                    <div className="stats-row">
                        <div className="stat-box">
                            <span className="stat-label">Taux d'épargne</span>
                            <span className="stat-val positive">
                                {totalRevenus > 0 ? (((totalRevenus - totalDepenses) / totalRevenus) * 100).toFixed(1) : 0}%
                            </span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">Dettes non remboursées</span>
                            <span className="stat-val text-danger">
                                {dettes.filter(d => !d.est_rembourse).length}
                            </span>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Reports;
