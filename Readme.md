## Tổng Quan Kiến Trúc Hệ Thống

Kiến trúc tổng thể sẽ bao gồm:

1.  **Clients**: Web/Mobile applications tương tác với hệ thống.
2.  **API Gateway**: Điểm vào duy nhất cho tất cả các request từ client. Xử lý authentication, routing, rate limiting, logging cơ bản.
3.  **Microservices**:
    *   **User Service**: Quản lý thông tin người dùng.
    *   **Appointment Service**: Quản lý lịch hẹn.
    *   **Medical Record Service**: Quản lý hồ sơ bệnh án.
    *   **Notification Service**: Gửi thông báo (email).
4.  **Databases**: Mỗi microservice sẽ có database riêng để đảm bảo tính độc lập.

Sơ đồ kiến trúc tổng thể:

```
+-----------------+     +-----------------+     +------------------------+
|   Web Client    | --> |                 | --> |    User Service        | -> [User DB]
+-----------------+     |                 |     +------------------------+
                        |                 |
+-----------------+     |  API Gateway    |     +------------------------+
|  Mobile Client  | --> |  (Authentication,| --> | Appointment Service    | -> [Appointment DB]
+-----------------+     |   Routing)      |     +------------------------+
                        |                 |
                        |                 |     +------------------------+
                        |                 | --> | Medical Record Service | -> [Medical Record DB]
                        |                 |     +------------------------+
                        |                 |
                        |                 |     +------------------------+
                        +-----------------+ --> |  Notification Service  | -> [Notification DB]
                                              +------------------------+
```

## I. API Gateway

*   **Chức năng chính**:
    1.  **Routing**: Điều hướng request đến microservice tương ứng dựa trên path.
        *   `/api/v1/users/*` -> User Service
        *   `/api/v1/auth/*` -> User Service (hoặc API Gateway xử lý trực tiếp nếu auth logic nằm ở Gateway)
        *   `/api/v1/appointments/*` -> Appointment Service
        *   `/api/v1/medical-records/*` -> Medical Record Service
        *   `/api/v1/notifications/*` -> Notification Service (có thể chỉ là internal API)
    2.  **Authentication**:
        *   Client gửi request login (`/api/v1/auth/login`) với username/password.
        *   API Gateway (hoặc User Service thông qua Gateway) xác thực thông tin.
        *   Nếu thành công, trả về một JSON Web Token (JWT). JWT chứa `user_id`, `role`, `expiration_time`.
        *   Cho các request tiếp theo, client gửi JWT trong header `Authorization: Bearer <token>`.
        *   API Gateway xác thực JWT (kiểm tra chữ ký, thời gian hết hạn).
        *   Nếu JWT hợp lệ, API Gateway có thể trích xuất thông tin user (ví dụ: `user_id`, `role`) và thêm vào header của request trước khi chuyển tiếp đến microservice (ví dụ: `X-User-ID`, `X-User-Role`).
    3.  **Rate Limiting**: Giới hạn số lượng request từ một IP hoặc user.
    4.  **Request/Response Transformation (Cơ bản)**: Có thể cần thiết trong một số trường hợp.
    5.  **Logging & Monitoring (Cơ bản)**: Ghi log các request đi qua Gateway.

## II. Thiết Kế Chi Tiết Các Microservices

### 1. User Service

*   **Miền nghiệp vụ**: Quản lý thông tin tất cả các loại người dùng (Admin, Patient, Doctor, Nurse, Staff khác).
*   **Database Schema (ví dụ với PostgreSQL)**:
    *   `users`:
        *   `id` (UUID, PK)
        *   `username` (VARCHAR, UNIQUE, NULLABLE - có thể dùng email làm username)
        *   `password_hash` (VARCHAR)
        *   `email` (VARCHAR, UNIQUE)
        *   `phone_number` (VARCHAR, UNIQUE, NULLABLE)
        *   `first_name` (VARCHAR)
        *   `last_name` (VARCHAR)
        *   `date_of_birth` (DATE, NULLABLE)
        *   `gender` (VARCHAR, NULLABLE - Male, Female, Other)
        *   `address` (TEXT, NULLABLE)
        *   `role` (VARCHAR - `ADMIN`, `PATIENT`, `DOCTOR`, `NURSE`)
        *   `is_active` (BOOLEAN, DEFAULT TRUE)
        *   `created_at` (TIMESTAMPZ)
        *   `updated_at` (TIMESTAMPZ)
    *   `doctor_profiles` (Nếu cần thông tin chuyên biệt cho bác sĩ):
        *   `user_id` (UUID, FK to users.id, PK)
        *   `specialization` (VARCHAR)
        *   `license_number` (VARCHAR, UNIQUE)
        *   `years_of_experience` (INTEGER)
        *   `department` (VARCHAR, NULLABLE)
    *   `nurse_profiles` (Tương tự cho y tá):
        *   `user_id` (UUID, FK to users.id, PK)
        *   `license_number` (VARCHAR, UNIQUE)
        *   `department` (VARCHAR, NULLABLE)
    *   `patient_profiles` (Tương tự cho bệnh nhân, ví dụ mã số bệnh nhân):
        *   `user_id` (UUID, FK to users.id, PK)
        *   `patient_code` (VARCHAR, UNIQUE, NULLABLE)
        *   `emergency_contact_name` (VARCHAR, NULLABLE)
        *   `emergency_contact_phone` (VARCHAR, NULLABLE)

*   **API Endpoints (Prefix: `/api/v1/users`)**:
    *   **Authentication (có thể xử lý bởi API Gateway hoặc ủy quyền cho User Service)**:
        *   `POST /auth/login`: Đăng nhập, trả về JWT.
            *   Request Body: `{ "email": "...", "password": "..." }`
            *   Response: `{ "access_token": "...", "refresh_token": "...", "user": { "id": "...", "role": "..." } }`
        *   `POST /auth/register`: Đăng ký (cho bệnh nhân tự đăng ký).
            *   Request Body: `{ "email": "...", "password": "...", "first_name": "...", ... }`
        *   `POST /auth/refresh-token`: Làm mới access token.
            *   Request Body: `{ "refresh_token": "..." }`
        *   `POST /auth/logout`: (Thường là client-side xóa token, nhưng có thể có endpoint để blacklist token).
    *   **User Management (Yêu cầu quyền Admin hoặc quyền phù hợp)**:
        *   `POST /`: Tạo người dùng mới (Admin tạo Doctor, Nurse, etc.).
            *   Request Body: Thông tin người dùng đầy đủ, bao gồm `role`.
        *   `GET /`: Lấy danh sách người dùng (có filter theo `role`, `is_active`, `search_term`).
        *   `GET /{user_id}`: Lấy thông tin chi tiết một người dùng.
        *   `PUT /{user_id}`: Cập nhật thông tin người dùng.
        *   `PATCH /{user_id}`: Cập nhật một phần thông tin người dùng (ví dụ: thay đổi `is_active`).
        *   `DELETE /{user_id}`: Xóa mềm người dùng (set `is_active = FALSE`).
    *   **Profile Management**:
        *   `GET /me`: Lấy thông tin người dùng đang đăng nhập (dựa trên JWT).
        *   `PUT /me`: Cập nhật thông tin người dùng đang đăng nhập.
    *   **Role-specific Endpoints**:
        *   `GET /doctors`: Lấy danh sách bác sĩ (có thể filter theo `specialization`, `department`).
        *   `GET /doctors/{doctor_id}/profile`: Lấy thông tin profile của bác sĩ.
        *   `GET /patients`: Lấy danh sách bệnh nhân (cho Admin, Doctor).

### 2. Appointment Service

*   **Miền nghiệp vụ**: Quản lý đặt hẹn, hủy hẹn, lịch trình của bác sĩ/y tá.
*   **Database Schema**:
    *   `appointments`:
        *   `id` (UUID, PK)
        *   `patient_id` (UUID, INDEXED - ID của bệnh nhân từ User Service)
        *   `doctor_id` (UUID, INDEXED - ID của bác sĩ từ User Service)
        *   `nurse_id` (UUID, NULLABLE, INDEXED - ID của y tá nếu có)
        *   `appointment_time` (TIMESTAMPZ)
        *   `duration_minutes` (INTEGER, DEFAULT 30)
        *   `status` (VARCHAR - `SCHEDULED`, `CONFIRMED`, `CANCELLED_PATIENT`, `CANCELLED_STAFF`, `COMPLETED`, `NO_SHOW`)
        *   `reason_for_visit` (TEXT, NULLABLE)
        *   `notes_patient` (TEXT, NULLABLE - ghi chú từ bệnh nhân khi đặt)
        *   `notes_staff` (TEXT, NULLABLE - ghi chú từ nhân viên)
        *   `created_at` (TIMESTAMPZ)
        *   `updated_at` (TIMESTAMPZ)
    *   `doctor_schedules` (Lịch làm việc của bác sĩ):
        *   `id` (UUID, PK)
        *   `doctor_id` (UUID, INDEXED)
        *   `start_time` (TIMESTAMPZ)
        *   `end_time` (TIMESTAMPZ)
        *   `is_available` (BOOLEAN, DEFAULT TRUE) // Có thể chia nhỏ thành các slot
        *   `notes` (TEXT, NULLABLE)
        *   `created_at` (TIMESTAMPZ)
        *   `updated_at` (TIMESTAMPZ)

*   **API Endpoints (Prefix: `/api/v1/appointments`)**:
    *   **Patient**:
        *   `POST /`: Bệnh nhân tạo lịch hẹn mới.
            *   Request Body: `{ "doctor_id": "...", "appointment_time": "...", "reason_for_visit": "..." }`
            *   Logic: Kiểm tra `doctor_id` có tồn tại và còn trống lịch vào `appointment_time` không.
        *   `GET /mine`: Lấy danh sách lịch hẹn của bệnh nhân đang đăng nhập.
        *   `PATCH /{appointment_id}/cancel`: Bệnh nhân hủy lịch hẹn.
    *   **Doctor/Nurse/Staff**:
        *   `GET /doctors/{doctor_id}`: Lấy danh sách lịch hẹn của một bác sĩ (theo ngày, tuần, tháng).
        *   `GET /patients/{patient_id}`: Lấy danh sách lịch hẹn của một bệnh nhân (cho bác sĩ/nhân viên).
        *   `GET /{appointment_id}`: Lấy chi tiết một lịch hẹn.
        *   `PUT /{appointment_id}`: Cập nhật lịch hẹn (ví dụ: bác sĩ xác nhận `CONFIRMED`, đổi giờ).
        *   `PATCH /{appointment_id}/confirm`: Xác nhận lịch hẹn.
        *   `PATCH /{appointment_id}/complete`: Đánh dấu lịch hẹn đã hoàn thành.
        *   `PATCH /{appointment_id}/cancel-staff`: Nhân viên hủy lịch hẹn.
    *   **Schedule Management (cho Doctor/Admin)**:
        *   `POST /doctors/{doctor_id}/schedule`: Tạo lịch làm việc cho bác sĩ.
            *   Request Body: `{ "start_time": "...", "end_time": "...", "is_recurring": false, "recurrence_pattern": null }`
        *   `GET /doctors/{doctor_id}/schedule`: Lấy lịch làm việc của bác sĩ.
        *   `GET /doctors/{doctor_id}/availability`: Lấy các khoảng thời gian trống của bác sĩ.
            *   Query Params: `date`, `duration_needed`
        *   `PUT /doctors/schedule/{schedule_id}`: Cập nhật một mục trong lịch làm việc.
        *   `DELETE /doctors/schedule/{schedule_id}`: Xóa một mục trong lịch làm việc.

*   **Giao tiếp với User Service**:
    *   Khi tạo/lấy lịch hẹn, cần thông tin `patient_id`, `doctor_id`. Service này có thể:
        1.  Gọi API của User Service để lấy thông tin chi tiết (tên, email) để hiển thị. (Đồng bộ)
        2.  Lưu trữ một bản sao tối giản thông tin người dùng liên quan (ví dụ: `patient_name`, `doctor_name`) và cập nhật qua cơ chế event (bất đồng bộ - phức tạp hơn).
        3.  API Gateway có thể inject `X-User-ID` của người dùng đang thực hiện request. Appointment Service sẽ dùng ID này cho `patient_id` khi bệnh nhân đặt lịch.

### 3. Medical Record Service

*   **Miền nghiệp vụ**: Lưu trữ, truy cập và cập nhật hồ sơ y tế của bệnh nhân.
*   **Database Schema (Đây là phần phức tạp, cần chi tiết hơn tùy yêu cầu)**:
    *   `medical_records`:
        *   `id` (UUID, PK)
        *   `patient_id` (UUID, INDEXED - ID của bệnh nhân từ User Service)
        *   `record_type` (VARCHAR - `CONSULTATION`, `LAB_RESULT`, `PRESCRIPTION`, `DIAGNOSIS`, `ALLERGY`, `VACCINATION`, `NOTE`)
        *   `encounter_id` (UUID, NULLABLE, INDEXED - Liên kết các record thuộc cùng một lần khám)
        *   `appointment_id` (UUID, NULLABLE, FK to appointments - nếu liên quan đến một lịch hẹn cụ thể)
        *   `created_by_user_id` (UUID - ID của Doctor/Nurse tạo record)
        *   `record_time` (TIMESTAMPZ - Thời điểm ghi nhận thông tin)
        *   `details` (JSONB - Lưu trữ cấu trúc dữ liệu linh hoạt cho từng `record_type`)
            *   Ví dụ cho `CONSULTATION`: `{ "symptoms": "...", "diagnosis_preliminary": "..." }`
            *   Ví dụ cho `PRESCRIPTION`: `{ "medications": [{ "name": "...", "dosage": "...", "frequency": "..."}], "notes": "..." }`
            *   Ví dụ cho `LAB_RESULT`: `{ "test_name": "...", "value": "...", "unit": "...", "reference_range": "...", "attachment_url": "link_to_scan.pdf" }`
        *   `is_sensitive` (BOOLEAN, DEFAULT FALSE)
        *   `created_at` (TIMESTAMPZ)
        *   `updated_at` (TIMESTAMPZ)
    *   `record_versions` (Lưu lịch sử thay đổi - quan trọng cho y tế):
        *   `id` (UUID, PK)
        *   `medical_record_id` (UUID, FK to medical_records.id)
        *   `changed_by_user_id` (UUID)
        *   `change_time` (TIMESTAMPZ)
        *   `previous_details` (JSONB)
        *   `change_reason` (TEXT, NULLABLE)

*   **API Endpoints (Prefix: `/api/v1/medical-records`)**:
    *   **Quyền của Doctor/Nurse (và Patient chỉ được xem của mình)**:
        *   `POST /patients/{patient_id}/records`: Tạo một mục hồ sơ y tế mới cho bệnh nhân.
            *   Request Body: `{ "record_type": "CONSULTATION", "appointment_id": "...", "details": { ... } }`
            *   Trong `X-User-ID` (từ API Gateway) sẽ là `created_by_user_id`.
        *   `GET /patients/{patient_id}/records`: Lấy danh sách hồ sơ y tế của bệnh nhân (có filter theo `record_type`, `date_range`).
            *   Patient chỉ xem được của mình. Doctor/Nurse có thể xem của bệnh nhân họ phụ trách.
        *   `GET /records/{record_id}`: Lấy chi tiết một mục hồ sơ y tế.
        *   `PUT /records/{record_id}`: Cập nhật một mục hồ sơ y tế (Ghi lại version).
            *   Request Body: `{ "details": { ... }, "update_reason": "..." }`
        *   `GET /records/{record_id}/history`: Xem lịch sử thay đổi của một mục hồ sơ.
    *   **Quyền của Patient**:
        *   `GET /mine/records`: Lấy danh sách hồ sơ y tế của bệnh nhân đang đăng nhập.
        *   `GET /mine/records/{record_id}`: Lấy chi tiết một mục hồ sơ y tế của bệnh nhân đang đăng nhập.

*   **Giao tiếp với User Service & Appointment Service**:
    *   Cần `patient_id` để xác định hồ sơ.
    *   Cần `created_by_user_id` để biết ai tạo/sửa.
    *   Có thể liên kết với `appointment_id`.

### 4. Notification Service (Chưa hoàn thiên)

*   **Miền nghiệp vụ**: Gửi thông báo, ban đầu là email.
*   **Database Schema**:
    *   `notifications`:
        *   `id` (UUID, PK)
        *   `recipient_user_id` (UUID, NULLABLE - nếu gửi cho người dùng trong hệ thống)
        *   `recipient_email` (VARCHAR - nếu gửi email trực tiếp)
        *   `subject` (VARCHAR)
        *   `body_template` (TEXT - tên template, ví dụ: `appointment_confirmation`)
        *   `body_context` (JSONB - dữ liệu để render template, ví dụ: `{ "patient_name": "...", "doctor_name": "...", "appointment_time": "..." }`)
        *   `type` (VARCHAR - `EMAIL`, `SMS` (tương lai))
        *   `status` (VARCHAR - `PENDING`, `SENT`, `FAILED`)
        *   `scheduled_send_time` (TIMESTAMPZ, NULLABLE)
        *   `sent_time` (TIMESTAMPZ, NULLABLE)
        *   `error_message` (TEXT, NULLABLE)
        *   `created_at` (TIMESTAMPZ)

*   **API Endpoints (Prefix: `/api/v1/notifications`)**:
    *   Đây thường là API nội bộ, được gọi bởi các service khác.
    *   `POST /send`: Gửi thông báo.
        *   Request Body:
            ```json
            {
              "recipient_user_id": "uuid-cua-patient", // Hoặc "recipient_email": "test@example.com"
              "template_name": "appointment_confirmation_patient",
              "context": {
                "patient_name": "Nguyễn Văn A",
                "doctor_name": "Trần Thị B",
                "appointment_time": "2023-10-27T10:00:00Z",
                "clinic_address": "123 Đường ABC"
              },
              "delivery_type": "EMAIL" // "SMS"
            }
            ```
    *   `GET /status/{notification_id}`: Kiểm tra trạng thái gửi.

*   **Hoạt động**:
    *   Ví dụ: Khi Appointment Service xác nhận một lịch hẹn, nó sẽ gọi `POST /api/v1/notifications/send` của Notification Service.
    *   Notification Service nhận request, lưu vào DB với status `PENDING`.
    *   Một worker (ví dụ: Celery task trong Django) sẽ quét các notification `PENDING` và gửi email qua một Email Service Provider (ESP) như SendGrid, Mailgun, hoặc SMTP server.
    *   Cập nhật status `SENT` hoặc `FAILED`.

### Chatbot

*   **Data chatbot tham khảo ở**:
    * https://github.com/codewithsomi/Symptom-Based-Disease-Prediction-Chatbot-Using-NLP
* Mô hình sử dụng: Random Forest
* Sử dụng FastAPI để build service chat

