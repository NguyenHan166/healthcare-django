from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import AppointmentViewSet, DoctorScheduleViewSet

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'doctors/schedule', DoctorScheduleViewSet, basename='doctor-schedule')

urlpatterns = [
    path('api/v1/', include(router.urls)),
]
