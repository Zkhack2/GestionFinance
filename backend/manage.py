#!/usr/bin/env python
"""Script d'entrée pour les commandes de gestion Django.

Ce fichier est utilisé pour lancer le serveur de développement, exécuter des
migrations, créer des superutilisateurs, etc.

Exemples :
  python manage.py runserver
  python manage.py migrate
  python manage.py createsuperuser
"""

import os
import sys


def main():
    """Point d'entrée principal exécuté lorsque le script est lancé."""

    # Définit la variable d'environnement indiquant le module de settings Django.
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        # Si Django n'est pas installé ou si l'environnement virtuel n'est pas activé,
        # on lève une erreur claire pour aider le développeur.
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    # Transmet la ligne de commande à Django (runserver, migrate, etc.).
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
