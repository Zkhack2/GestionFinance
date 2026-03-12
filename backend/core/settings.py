"""Configuration principale de Django pour le projet GestionFinance.

Ce fichier contient tous les réglages (settings) nécessaires pour faire
fonctionner l'application en local : base de données, applications installées,
middleware, localisation, etc.

ATTENTION : ce fichier contient des valeurs de développement (SECRET_KEY publique,
DEBUG activé, CORS ouvert) qui ne doivent pas être utilisés en production.
"""

import os
from pathlib import Path

from dotenv import load_dotenv
import dj_database_url


# ---------------------------------------------------------------------------
# Chemins de base
# ---------------------------------------------------------------------------
# BASE_DIR représente le répertoire racine du projet (celui qui contient manage.py).
BASE_DIR = Path(__file__).resolve().parent.parent


# ---------------------------------------------------------------------------
# Chargement des variables d'environnement
# ---------------------------------------------------------------------------
# Ce fichier permet de stocker des valeurs locales (SECRET_KEY, DEBUG, etc.)
# sans les committer dans le dépôt. En production, Render/Vercel utilise
# les variables d'environnement définies dans l'interface.
load_dotenv(BASE_DIR / '.env')


# ---------------------------------------------------------------------------
# Paramètres de développement / sécurité
# ---------------------------------------------------------------------------

# Clé secrète utilisée par Django pour signer les sessions, les tokens, etc.
# En production, renseigner DJANGO_SECRET_KEY dans les variables d'environnement.
SECRET_KEY = os.getenv(
    'DJANGO_SECRET_KEY',
    'django-insecure-r6eq!0vkn&g-z&sm*ug!itptr#q#@1rv-l)+_3#a7drxmx5u#f',
)

# Activer le mode debug en développement (affiche des erreurs détaillées).
# Défini via DJANGO_DEBUG ("True"/"False").
DEBUG = os.getenv('DJANGO_DEBUG', 'True').lower() in ('1', 'true', 'yes')

# Liste des hôtes autorisés à accéder à l'application.
# En production, définir DJANGO_ALLOWED_HOSTS (ex: "mon-domaine.com,api.mondomaine.com").
allowed_hosts_env = os.getenv('DJANGO_ALLOWED_HOSTS', '')
ALLOWED_HOSTS = [h.strip() for h in allowed_hosts_env.split(',') if h.strip()] or ['*']


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
# En développement, SQLite est utilisé par défaut.
# En production, Render (ou autre) peut fournir DATABASE_URL.
DATABASE_URL = os.getenv('DATABASE_URL')

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600, ssl_require=True),
    }
else:
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
# Autorise toutes les origines en développement (DEBUG=True). En production,
# définir CORS_ALLOWED_ORIGINS (liste séparée par des virgules) ou activer
# CORS_ALLOW_ALL_ORIGINS via variable d'environnement.
CORS_ALLOW_ALL_ORIGINS = DEBUG or os.getenv('CORS_ALLOW_ALL_ORIGINS', 'False').lower() in ('1', 'true', 'yes')

env_cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', '')
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
] + [o.strip() for o in env_cors_origins.split(',') if o.strip()]


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
