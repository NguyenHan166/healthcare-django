from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, DoctorViewSet , RegisterAPIView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'api/v1/users', UserViewSet, basename='user')
router.register(r'api/v1/doctors', DoctorViewSet, basename='doctor')

urlpatterns = [
    path('', include(router.urls)),
    path('api/v1/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/refresh-token/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/register/', RegisterAPIView.as_view(), name='register'),
]
