import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import DettesFactures from './pages/DettesFactures';
import Reports from './pages/Reports';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/dettes-factures" element={<DettesFactures />} />
        <Route path="/rapports" element={<Reports />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
}

export default App;
