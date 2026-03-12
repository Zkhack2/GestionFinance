"""Configuration des URL pour le projet GestionFinance.

Ce module définit les routes URL exposées par l'application Django.
Chaque route est associée à une vue (fonctionnelle ou basée sur une classe).

- `/admin/` : interface d'administration Django.
- `/api/` : API REST utilisée par le frontend.
- `/api/token/` : points d'accès pour l'authentification JWT.
- `/api/password_reset/` : endpoints pour la réinitialisation du mot de passe.
"""

from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# `urlpatterns` est la liste des routes de l'application.
urlpatterns = [
    # Interface d'administration Django
    path('admin/', admin.site.urls),

    # Toutes les routes de l'API (transactions, dettes, factures, etc.)
    path('api/', include('api.urls')),

    # Endpoints JWT pour l'authentification
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Endpoints de réinitialisation de mot de passe fournis par Django (HTML par défaut)
    path('api/password_reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('api/password_reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('api/reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('api/reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
]
