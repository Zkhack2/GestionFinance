from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Transaction, Dette, Facture
from .serializers import TransactionSerializer, DetteSerializer, FactureSerializer, UserSerializer
from django.contrib.auth.models import User

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

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
