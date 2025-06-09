from rest_framework import viewsets, status, permissions, filters, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Appointment, DoctorSchedule
from .serializers import AppointmentSerializer, DoctorScheduleSerializer
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.dateparse import parse_datetime
from datetime import timedelta
from .utils import is_doctor_available
from rest_framework.permissions import AllowAny
from .utils import get_user_info_sync

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['patient_id', 'doctor_id', 'status']
    ordering_fields = ['appointment_time']
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action in ['cancel', 'cancel_staff', 'confirm', 'complete', 'update']:
            return [permissions.IsAuthenticated()]
        else:
            return [permissions.AllowAny()]

    def perform_create(self, serializer):
        # Kiểm tra doctor_id tồn tại và còn lịch trống
        doctor_id = serializer.validated_data['doctor_id']
        appointment_time = serializer.validated_data['appointment_time']
        duration = serializer.validated_data.get('duration_minutes', 30)
   
        if not is_doctor_available(doctor_id, appointment_time, duration):
            raise serializers.ValidationError("Bác sĩ không có lịch trống vào thời gian này")

        serializer.save(status='SCHEDULED')

    @action(detail=False, methods=['get'], url_path='mine')
    def mine(self, request):
        user_id = request.headers.get('X-User-ID') or request.user.id
        appointments = self.queryset.filter(patient_id=user_id)
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='cancel')
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'CANCELLED_PATIENT'
        appointment.save()
        return Response({'status': 'Cancelled by patient'})

    @action(detail=True, methods=['patch'], url_path='cancel-staff')
    def cancel_staff(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'CANCELLED_STAFF'
        appointment.save()
        return Response({'status': 'Cancelled by staff'})

    @action(detail=True, methods=['patch'], url_path='confirm')
    def confirm(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'CONFIRMED'
        appointment.save()
        return Response({'status': 'Confirmed'})

    @action(detail=True, methods=['patch'], url_path='complete')
    def complete(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'COMPLETED'
        appointment.save()
        return Response({'status': 'Completed'})

    @action(detail=True, methods=['get'])
    def detail_with_user(self, request, pk=None):
        appointment = self.get_object()
        token = request.headers.get('Authorization').split(' ')[1]
        patient_info = get_user_info_sync(str(appointment.patient_id), token)
        doctor_info = get_user_info_sync(str(appointment.doctor_id), token)

        data = self.get_serializer(appointment).data
        data['patient_info'] = patient_info
        data['doctor_info'] = doctor_info
        return Response(data)

class DoctorScheduleViewSet(viewsets.ModelViewSet):
    queryset = DoctorSchedule.objects.all()
    serializer_class = DoctorScheduleSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['doctor_id']

    def get_permissions(self):
        # Có thể giới hạn admin/doctor mới tạo sửa lịch
        return [permissions.IsAuthenticated()]
