from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, DetteViewSet, FactureViewSet

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'dettes', DetteViewSet, basename='dette')
router.register(r'factures', FactureViewSet, basename='facture')

urlpatterns = [
    path('', include(router.urls)),
]
