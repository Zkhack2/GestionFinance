"""Sérialiseurs pour l'API Django REST.

Ce module définit les schémas d'entrée/sortie JSON utilisés par l'API pour
créer et lire les objets en base de données (utilisateurs, transactions, etc.).
"""

from rest_framework import serializers
from .models import Transaction, Dette, Facture, Budget
from django.contrib.auth.models import User
from .password_validators import validate_password_strength


# --- SÉRIALISEUR UTILISATEUR ---
# Ce sérialiseur gère la création d'un nouvel utilisateur (inscription).
# Il s'assure notamment que le mot de passe n'est pas renvoyé dans les réponses.
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

    def validate_password(self, value):
        """Valide la force minimale du mot de passe pour l'inscription."""
        return validate_password_strength(value)


# --- SÉRIALISEURS DES OBJETS MÉTIER ---
# Les autres sérialiseurs exposent tous les champs des modèles correspondants.
# L'utilisateur est défini automatiquement par la vue (user connecté), donc il est
# en lecture seule pour éviter toute modification accidentelle via l'API.

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__' # On expose tous les champs du modèle
        # 'user' est en lecture seule car il est défini automatiquement via la requête
        read_only_fields = ['user']


class DetteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dette
        fields = '__all__'
        read_only_fields = ['user']


class FactureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facture
        fields = '__all__'
        read_only_fields = ['user']


class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = '__all__'
        read_only_fields = ['user']

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
