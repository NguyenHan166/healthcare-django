from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicalRecordViewSet

router = DefaultRouter()
router.register(r'medical-records/(?P<patient_id>[^/.]+)', MedicalRecordViewSet, basename='medical-record')
urlpatterns = [
    path('api/v1/', include(router.urls)),
]
