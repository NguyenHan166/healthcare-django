from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse, PlainTextResponse
import httpx
from jose import jwt, JWTError
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specify specific origins like ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods, or specify as needed (["GET", "POST", "PUT", "DELETE"])
    allow_headers=["*"],  # Allow all headers
)

# Config JWT
JWT_SECRET = "your_jwt_secret_key"
JWT_ALGORITHM = "HS256"

# Mapping routes to backend services
SERVICE_MAP = {
    "/api/v1/users": "http://localhost:8001/api/v1/users",
    "/api/v1/auth": "http://localhost:8001/api/v1/auth",
    "/api/v1/doctors": "http://localhost:8001/api/v1/doctors",
    "/api/v1/appointments": "http://localhost:8002/api/v1/appointments",
    "/api/v1/medical-records": "http://localhost:8003/api/v1/medical-records",
    "/api/v1/notifications": "http://localhost:8004/api/v1/notifications",
}

# Rate limit error handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})

# Helper: Validate JWT and extract payload
def verify_jwt(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# Route all /api/v1/* requests here
@app.api_route("/api/v1/{full_path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE" , "OPTIONS"])
@limiter.limit("100/minute")  # Rate limiting: 100 requests per minute per IP
async def proxy_request(full_path: str, request: Request):
    path = "/api/v1/" + full_path

    # Find which service to route
    backend_url = None
    for prefix, url in SERVICE_MAP.items():
        if path.startswith(prefix):
            backend_url = url
            break
    if not backend_url:
        raise HTTPException(status_code=404, detail="Service not found")

    # Extract JWT from Authorization header
    auth_header = request.headers.get("Authorization")
    user_id = None
    user_role = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
        print(token)
        payload = verify_jwt(token)
        user_id = payload.get("user_id")
        user_role = payload.get("role")
    else:
        # Với các API public (vd: /api/v1/auth/login) có thể không cần token
        if path.startswith("/api/v1/auth/login") or path.startswith("/api/v1/auth/register"):
            pass
        else:
            raise HTTPException(status_code=401, detail="Authorization token missing")

    # Chuẩn bị forward request
    client = httpx.AsyncClient(follow_redirects=True)
    try:
        url = backend_url + path[len(prefix):]

        # Copy method
        method = request.method

        # Copy body
        body = await request.body()

        # Copy headers, thêm X-User-ID, X-User-Role
        headers = dict(request.headers)
        if user_id:
            headers["X-User-ID"] = user_id
        if user_role:
            headers["X-User-Role"] = user_role
        # Xóa Authorization nếu backend không cần hoặc bạn muốn giới hạn
        # headers.pop("Authorization", None)

        # Gửi request đến backend
        resp = await client.request(method, url, content=body, headers=headers, params=request.query_params)

        print(f"Response from backend: {resp.status_code} - {resp.text}")
        print(f"Redirect Location: {resp.headers.get('Location')}")

        try:
            response_content = resp.json()  # This will raise an error if the content is not valid JSON
            return JSONResponse(status_code=resp.status_code, content=response_content)
        except httpx.HTTPStatusError as e:
            # If the response is not JSON, return it as plain text or handle accordingly
            return PlainTextResponse(content=resp.text, status_code=resp.status_code)
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": str(e)})
    finally:
        await client.aclose()
