from .models import Appointment
from datetime import timedelta
import httpx
import requests

def is_doctor_available(doctor_id, start_time, duration):
    end_time = start_time + timedelta(minutes=duration)
    conflicts = Appointment.objects.filter(
        doctor_id=doctor_id,
        status__in=['SCHEDULED', 'CONFIRMED'],
        appointment_time__lt=end_time,
    ).filter(
        appointment_time__gte=start_time - timedelta(minutes=duration)
    )
    return not conflicts.exists()



USER_SERVICE_URL = "http://localhost:8001/api/v1/users/"

def get_user_info_sync(user_id: str, token: str = None):
    headers = {}
    if token:
        headers['Authorization'] = f"Bearer {token}"
    response = requests.get(f"{USER_SERVICE_URL}{user_id}/", headers=headers, timeout=5)
    if response.status_code == 200:
        return response.json()
    else:
        return None