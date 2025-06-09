from rest_framework import viewsets, permissions
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import MedicalRecord, MedicalRecordVersion
from .serializers import MedicalRecordSerializer, MedicalRecordVersionSerializer
from .utils import get_user_info_sync

class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'])
    def history(self, request):
        # Lấy lịch sử thay đổi của hồ sơ y tế
        record = self.get_object()
        versions = MedicalRecordVersion.objects.filter(medical_record=record)
        serializer = MedicalRecordVersionSerializer(versions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'],)
    def medical_records_details(self, request, patient_id=None):
        # Xử lý patient_id từ kwargs
        try:
            # Tìm bản ghi từ patient_id
            record = self.get_queryset().filter(patient_id=patient_id).first()

            if not record:
                return Response({"detail": "Record not found."}, status=404)

            # Lấy thông tin bệnh nhân
            token = request.headers.get('Authorization').split(' ')[1]
            patient_info = get_user_info_sync(record.patient_id, token)

            # Serializer dữ liệu
            data = self.get_serializer(record).data
            data['patient_info'] = patient_info
            return Response(data)
        except Exception as e:
            return Response({"detail": str(e)}, status=500)