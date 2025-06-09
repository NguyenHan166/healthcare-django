import requests


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