from rest_framework import serializers
from .models import Transaction, Dette, Facture
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
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
