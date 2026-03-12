import re

from rest_framework.exceptions import ValidationError


# Ce module contient des validations partagées pour les mots de passe.
# Il est utilisé dans l'API d'inscription et lors du changement de mot de passe.

def validate_password_strength(password: str) -> str:
    """Vérifie la force minimale d'un mot de passe.

    Actuellement, la seule règle appliquée est une longueur minimale de 8 caractères.

    Args:
        password (str): Le mot de passe à vérifier.

    Raises:
        ValidationError: Si le mot de passe ne respecte pas la règle.

    Returns:
        str: Le mot de passe tel quel (pour être réutilisé par DRF).
    """

    # On protège contre la valeur None en la transformant en chaîne vide
    if len(password or "") < 8:
        raise ValidationError('Le mot de passe doit contenir au moins 8 caractères.')

    return password
