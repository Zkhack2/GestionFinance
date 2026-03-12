import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const SidebarLayout = ({ children }) => {
    const navigate = useNavigate();
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const confirmLogout = () => setLogoutModalOpen(true);
    const cancelLogout = () => setLogoutModalOpen(false);
    const doLogout = () => {
        setLogoutModalOpen(false);
        handleLogout();
    };

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
                <button onClick={confirmLogout} className="btn btn-secondary btn-block">
                    <span style={{ marginRight: '0.5rem' }}>🚪</span> Déconnexion
                </button>
            </div>

            <main className="dashboard-content page-container">
                {children}
            </main>

            {logoutModalOpen && (
                <div className="modal-overlay" onClick={cancelLogout}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Confirmer la déconnexion</h3>
                        <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={cancelLogout}>
                                Annuler
                            </button>
                            <button className="btn" onClick={doLogout}>
                                Déconnecter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SidebarLayout;
