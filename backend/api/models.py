from django.db import models
from django.contrib.auth.models import User

# --- MODÈLE DES TRANSACTIONS ---
# Ce modèle enregistre chaque mouvement d'argent (Revenu ou Dépense).
class Transaction(models.Model):
    # On définit les options possibles pour le type de transaction
    TYPE_CHOICES = (('REVENU', 'Revenu'), ('DEPENSE', 'Dépense'))
    
    # ForeignKey lie la transaction à un utilisateur spécifique. 
    # on_delete=models.CASCADE signifie que si l'utilisateur est supprimé, ses transactions le sont aussi.
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # DecimalField est utilisé pour l'argent (plus précis que Float)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Choix restreint entre Revenu et Dépense
    type_transaction = models.CharField(max_length=10, choices=TYPE_CHOICES)
    
    description = models.CharField(max_length=255)
    
    # Enregistre automatiquement la date et l'heure à la création
    date_creation = models.DateTimeField(auto_now_add=True)

    # Cette méthode définit comment l'objet s'affiche dans l'administration Django
    def __str__(self):
        return f"{self.type_transaction} - {self.montant}€"

# --- MODÈLE DES DETTES ---
# Pour suivre ce que l'on doit ou ce que l'on nous doit.
class Dette(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    creancier_ou_debiteur = models.CharField(max_length=100) # Nom de la personne concernée
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True) # Champ optionnel
    date_emprunt = models.DateField()
    date_echeance = models.DateField(blank=True, null=True)
    est_rembourse = models.BooleanField(default=False) # Case à cocher (Vrai/Faux)
    
    def __str__(self):
        return f"Dette: {self.montant}€ - {self.creancier_ou_debiteur}"

# --- MODÈLE DES FACTURES ---
# Pour gérer les paiements à venir (électricité, loyer, etc.)
class Facture(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    titre = models.CharField(max_length=255)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    date_emission = models.DateField()
    date_echeance = models.DateField()
    est_payee = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Facture: {self.titre} - {self.montant}€"

# --- MODÈLE DU BUDGET ---
# Un budget permet de fixer une limite de dépenses pour un mois précis.
class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    mois = models.IntegerField() # 1 pour Janvier, 12 pour Décembre
    annee = models.IntegerField()
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Budget {self.mois}/{self.annee} - {self.montant} €"
