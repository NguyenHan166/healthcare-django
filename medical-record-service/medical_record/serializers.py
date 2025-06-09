from rest_framework import serializers
from .models import MedicalRecord, MedicalRecordVersion

class MedicalRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalRecord
        fields = ['id', 'patient_id', 'record_type', 'appointment_id', 'created_by_user_id',
                  'record_time', 'details', 'is_sensitive', 'created_at', 'updated_at']

class MedicalRecordVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalRecordVersion
        fields = ['id', 'medical_record', 'changed_by_user_id', 'change_time', 'previous_details', 'change_reason']
