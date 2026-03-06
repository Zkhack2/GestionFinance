from django.db import models
from django.contrib.auth.models import User

class Transaction(models.Model):
    TYPE_CHOICES = (('REVENU', 'Revenu'), ('DEPENSE', 'Dépense'))
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    type_transaction = models.CharField(max_length=10, choices=TYPE_CHOICES)
    description = models.CharField(max_length=255)
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type_transaction} - {self.montant}€"

class Dette(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    creancier_ou_debiteur = models.CharField(max_length=100)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    date_emprunt = models.DateField()
    date_echeance = models.DateField(blank=True, null=True)
    est_rembourse = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Dette: {self.montant}€ - {self.creancier_ou_debiteur}"

class Facture(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    titre = models.CharField(max_length=255)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    date_emission = models.DateField()
    date_echeance = models.DateField()
    est_payee = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Facture: {self.titre} - {self.montant}€"
