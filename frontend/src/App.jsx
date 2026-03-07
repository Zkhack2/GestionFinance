import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import DettesFactures from './pages/DettesFactures';
import Reports from './pages/Reports';
import ForgotPassword from './pages/ForgotPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';
import ThemeToggle from './components/ThemeToggle';

// Le composant App est le "coeur" de l'application
function App() {
  return (
    <div className="App">
      {/* Composant de changement de thème (clair/sombre) présent sur toutes les pages */}
      <ThemeToggle />
      
      {/* Définition de toutes les "pages" (routes) de notre site */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/dettes-factures" element={<DettesFactures />} />
        <Route path="/rapports" element={<Reports />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Route dynamique : :uid et :token changent selon le lien reçu par email */}
        <Route path="/reset/:uid/:token" element={<ResetPasswordConfirm />} />
        
        {/* Si l'utilisateur va sur la racine "/", on le redirige vers le dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
}

export default App;
