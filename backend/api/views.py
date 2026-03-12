"""Views (API endpoints) pour l'application de gestion financière.

Ce module expose des endpoints REST pour :
- l'inscription des utilisateurs
- la gestion des transactions, dettes, factures et budgets
- l'export CSV des transactions
- le changement de mot de passe

Les vues utilisent Django REST Framework (DRF).
"""

from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Transaction, Dette, Facture, Budget
from .serializers import (
    TransactionSerializer, DetteSerializer, FactureSerializer, 
    UserSerializer, BudgetSerializer
)
from .password_validators import validate_password_strength
import csv
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework import status


# --- VUE D'INSCRIPTION ---
# Cette vue permet à un nouvel utilisateur de s'inscrire (POST /register).
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    # AllowAny : n'importe qui peut s'inscrire sans être connecté
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

# --- VUES DES TRANSACTIONS ---
# ModelViewSet gère automatiquement : GET (liste), POST (créer), GET id (détail), PUT (modifier), DELETE
class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    # Seul un utilisateur connecté peut accéder à ses données
    permission_classes = [IsAuthenticated]

    # Cette méthode filtre les données pour ne renvoyer QUE celles de l'utilisateur connecté
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-date_creation')

    # Cette méthode injecte automatiquement l'utilisateur connecté lors de la création
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# --- VUES DES DETTES ---
class DetteViewSet(viewsets.ModelViewSet):
    serializer_class = DetteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Dette.objects.filter(user=self.request.user).order_by('date_echeance')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# --- VUES DES FACTURES ---
class FactureViewSet(viewsets.ModelViewSet):
    serializer_class = FactureSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Facture.objects.filter(user=self.request.user).order_by('date_echeance')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
# --- VUES DU BUDGET ---
class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user).order_by('-annee', '-mois')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# --- VUE D'EXPORTATION CSV ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_transactions_csv(request):
    # Création du fichier CSV
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="transactions.csv"'
    
    writer = csv.writer(response)
    # En-têtes du fichier
    writer.writerow(['Date', 'Type', 'Montant', 'Description'])
    
    # Récupération des données de l'utilisateur
    transactions = Transaction.objects.filter(user=request.user)
    
    for t in transactions:
        writer.writerow([t.date_creation, t.type_transaction, t.montant, t.description])
        
    return response

# --- VUE DE CHANGEMENT DE MOT DE PASSE ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Permet à un utilisateur connecté de changer son mot de passe."""
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response(
            {'error': 'Les champs ancien et nouveau mot de passe sont requis.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Vérifier que l'ancien mot de passe est correct
    if not request.user.check_password(old_password):
        return Response(
            {'error': 'L\'ancien mot de passe est incorrect.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Vérifier la force du nouveau mot de passe
    try:
        validate_password_strength(new_password)
    except Exception as e:
        # REST framework ValidationError stores details as a list/dict
        message = getattr(e, 'detail', str(e))
        return Response(
            {'error': message},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Changer le mot de passe
    request.user.set_password(new_password)
    request.user.save()
    
    return Response({'message': 'Mot de passe modifié avec succès.'}, status=status.HTTP_200_OK)
