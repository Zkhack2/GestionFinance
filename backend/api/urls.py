from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, DetteViewSet, FactureViewSet, RegisterView

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'dettes', DetteViewSet, basename='dette')
router.register(r'factures', FactureViewSet, basename='facture')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('', include(router.urls)),
]
