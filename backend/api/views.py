from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Transaction, Dette, Facture, Budget
from .serializers import (
    TransactionSerializer, DetteSerializer, FactureSerializer, 
    UserSerializer, BudgetSerializer
)
import csv
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User

# --- VUE D'INSCRIPTION ---
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
