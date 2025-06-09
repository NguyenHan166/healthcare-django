from django.db import models
import uuid

class MedicalRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient_id = models.UUIDField()  # sẽ lưu ID của bệnh nhân từ User Service
    record_type = models.CharField(max_length=50, choices=[
        ('CONSULTATION', 'Consultation'),
        ('LAB_RESULT', 'Lab Result'),
        ('PRESCRIPTION', 'Prescription'),
        ('DIAGNOSIS', 'Diagnosis'),
        ('ALLERGY', 'Allergy'),
        ('VACCINATION', 'Vaccination'),
        ('NOTE', 'Note'),
    ])
    appointment_id = models.UUIDField(null=True, blank=True)  # FK tới Appointment Service
    created_by_user_id = models.UUIDField()  # Người tạo record (bác sĩ/y tá)
    record_time = models.DateTimeField(auto_now_add=True)
    details = models.JSONField()  # Lưu trữ thông tin chi tiết của từng loại record
    is_sensitive = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Record {self.record_type} for patient {self.patient_id}"

class MedicalRecordVersion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medical_record = models.ForeignKey(MedicalRecord, related_name='versions', on_delete=models.CASCADE)
    changed_by_user_id = models.UUIDField()
    change_time = models.DateTimeField(auto_now_add=True)
    previous_details = models.JSONField()
    change_reason = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Version of Record {self.medical_record.id} by {self.changed_by_user_id}"
