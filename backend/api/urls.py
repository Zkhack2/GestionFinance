from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TransactionViewSet, DetteViewSet, FactureViewSet, 
    RegisterView, BudgetViewSet, export_transactions_csv, change_password
)

# On utilise un "Router" qui crée automatiquement toutes les routes standard
# (liste, création, modification, suppression) pour nos vues
router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'dettes', DetteViewSet, basename='dette')
router.register(r'factures', FactureViewSet, basename='facture')
router.register(r'budgets', BudgetViewSet, basename='budget')

# Définition des URLs de l'API
urlpatterns = [
    # Route pour l'inscription d'un nouvel utilisateur
    path('register/', RegisterView.as_view(), name='register'),
    
    # Inclusion de toutes les routes générées par le router
    path('', include(router.urls)),
    # Route personnalisée pour l'export CSV
    path('export-csv/', export_transactions_csv, name='export-csv'),
    # Route pour changer le mot de passe
    path('change-password/', change_password, name='change-password'),
]
