from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Transaction, Dette, Facture
from .serializers import TransactionSerializer, DetteSerializer, FactureSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-date_creation')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DetteViewSet(viewsets.ModelViewSet):
    serializer_class = DetteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Dette.objects.filter(user=self.request.user).order_by('date_echeance')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FactureViewSet(viewsets.ModelViewSet):
    serializer_class = FactureSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Facture.objects.filter(user=self.request.user).order_by('date_echeance')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
