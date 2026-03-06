# Application de Gestion Financière Simplifiée

Un projet fullstack (Django REST + React Vite) de 45 jours.

## Fonctionnalités
- **Authentification sécurisée** via JSON Web Tokens (JWT).
- **Dashboard analytique** : Résumé des soldes, revenus et dépenses.
- **Transactions** : Historique complet avec ajout, suppression et calculs type de flux.
- **Dettes et Factures** : Système d'alerte automatique des retards (+ pastilles de couleurs).
- **Rapports Interactifs** : Graphiques (Recharts) sur les dépenses vs revenus par catégories.

## UI/UX
Design "Glassmorphism" : Interface moderne et réactive avec modes sombres/transparents fluides.

## Installation Locale
1. **Backend (Python)** : 
   `cd backend` -> `python -m venv venv` -> `pip install -r requirements.txt` (ou libs manuelles) -> `python manage.py migrate` -> `python manage.py runserver`
2. **Frontend (React)** :
   `cd frontend` -> `npm install` -> `npm run dev`

**Compte de test pré-configuré :**
- Username: `admin`
- Password: `admin`

*Développé comme projet académique.*
