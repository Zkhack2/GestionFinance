from rest_framework import serializers
from .models import Transaction, Dette, Facture, Budget
from django.contrib.auth.models import User

# --- SÉRIALISEUR UTILISATEUR ---
# Un sérialiseur transforme les objets Python (modèles) en format JSON (pour le web)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # On définit les champs que l'API peut lire/écrire
        fields = ('id', 'username', 'email', 'password')
        # On cache le mot de passe : il ne sera jamais renvoyé par l'API (sécurité)
        extra_kwargs = {'password': {'write_only': True}}
        
    # Cette méthode gère la création sécurisée d'un utilisateur
    def create(self, validated_data):
        # On utilise create_user pour que Django hache le mot de passe automatiquement
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

# --- SÉRIALISEUR TRANSACTION ---
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__' # On expose tous les champs du modèle
        # 'user' est en lecture seule car il est défini automatiquement via la requête
        read_only_fields = ['user']

# --- SÉRIALISEUR DETTE ---
class DetteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dette
        fields = '__all__'
        read_only_fields = ['user']

# --- SÉRIALISEUR FACTURE ---
class FactureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facture
        fields = '__all__'
        read_only_fields = ['user']
# --- SÉRIALISEUR BUDGET ---
class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = '__all__'
        read_only_fields = ['user']
