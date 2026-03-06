import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import api from '../api/axios';
import './Reports.css';

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'];

const Reports = () => {
    const [transactions, setTransactions] = useState([]);
    const [dettes, setDettes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [resTrans, resDettes] = await Promise.all([
                    api.get('transactions/'),
                    api.get('dettes/')
                ]);
                setTransactions(resTrans.data);
                setDettes(resDettes.data);
            } catch (err) {
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

    if (loading) return <div className="page-container"><p>Chargement des rapports...</p></div>;

    return (
        <div className="dashboard-layout">
            <nav className="sidebar glass-panel">
                <div className="logo-container">
                    <span className="logo-icon-small">💸</span>
                    <h2>Djago</h2>
                </div>
                <ul className="nav-links">
                    <li><a href="/dashboard">Tableau de bord</a></li>
                    <li><a href="/transactions">Transactions</a></li>
                    <li><a href="/dettes-factures">Dettes & Factures</a></li>
                    <li className="active"><a href="/rapports">Rapports</a></li>
                </ul>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="btn btn-secondary btn-block">Déconnexion</button>
                </div>
            </nav>

            <main className="dashboard-content page-container">
                <header className="dashboard-header">
                    <h1 className="title">Analyses et Statistiques</h1>
                    <p className="subtitle">Visualisez la répartition de votre budget</p>
                </header>

                <div className="charts-grid">
                    <div className="glass-panel chart-card">
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

                    <div className="glass-panel chart-card">
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
                </div>

                <div className="glass-panel summary-stats">
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
