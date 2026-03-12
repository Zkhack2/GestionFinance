"""Configuration principale de Django pour le projet GestionFinance.

Ce fichier contient tous les réglages (settings) nécessaires pour faire
fonctionner l'application en local : base de données, applications installées,
middleware, localisation, etc.

ATTENTION : ce fichier contient des valeurs de développement (SECRET_KEY publique,
DEBUG activé, CORS ouvert) qui ne doivent pas être utilisés en production.
"""

from pathlib import Path


# ---------------------------------------------------------------------------
# Chemins de base
# ---------------------------------------------------------------------------
# BASE_DIR représente le répertoire racine du projet (celui qui contient manage.py).
BASE_DIR = Path(__file__).resolve().parent.parent


# ---------------------------------------------------------------------------
# Paramètres de développement / sécurité
# ---------------------------------------------------------------------------

# Clé secrète utilisée par Django pour signer les sessions, les tokens, etc.
# Ne jamais exposer cette clé en production.
SECRET_KEY = 'django-insecure-r6eq!0vkn&g-z&sm*ug!itptr#q#@1rv-l)+_3#a7drxmx5u#f'

# Activer le mode debug en développement (affiche des erreurs détaillées).
DEBUG = True

# Liste des hôtes autorisés à accéder à l'application.
# En production, remplacer par la liste des domaines autorisés.
ALLOWED_HOSTS = ['*']


# ---------------------------------------------------------------------------
# Applications installées
# ---------------------------------------------------------------------------
INSTALLED_APPS = [
    # Apps Django par défaut
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Bibliothèques tierces
    'rest_framework',
    'corsheaders',

    # App métier
    'api',
]


# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------
# Le middleware est une suite de composants qui traitent chaque requête/response.
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# ---------------------------------------------------------------------------
# URL configuration
# ---------------------------------------------------------------------------
ROOT_URLCONF = 'core.urls'


# ---------------------------------------------------------------------------
# Templates
# ---------------------------------------------------------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# ---------------------------------------------------------------------------
# WSGI
# ---------------------------------------------------------------------------
# Point d'entrée WSGI pour le déploiement.
WSGI_APPLICATION = 'core.wsgi.application'


# ---------------------------------------------------------------------------
# Base de données
# ---------------------------------------------------------------------------
# Utilise SQLite pour le développement (base de données fichier).
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# ---------------------------------------------------------------------------
# Validation du mot de passe
# ---------------------------------------------------------------------------
# Ces validateurs sont exécutés lors de la création / modification de mot de passe.
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# ---------------------------------------------------------------------------
# Internationalisation
# ---------------------------------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# ---------------------------------------------------------------------------
# Fichiers statiques (CSS, JS, images)
# ---------------------------------------------------------------------------
STATIC_URL = 'static/'


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
# Autorise toutes les origines (utile en développement, à restreindre en production).
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


# ---------------------------------------------------------------------------
# REST Framework
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}


# ---------------------------------------------------------------------------
# Email
# ---------------------------------------------------------------------------
# En développement, les emails sont simplement affichés dans la console.
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
