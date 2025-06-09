import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Appointments = () => {
  const { user, loading, apiRequest } = useContext(AuthContext);
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    doctor_id: '',
    appointment_time: '',
    reason_for_visit: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Fetch doctors and appointments on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch doctors (assuming endpoint exists)
        const doctorsData = await apiRequest('get', 'http://localhost:8000/api/v1/doctors/');
        setDoctors(doctorsData);
        // Fetch user's appointments
        const appointmentsData = await apiRequest('get', 'http://localhost:8000/api/v1/appointments/mine');
        setAppointments(appointmentsData);
      } catch (error) {
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      }
    };
    if (user) fetchData();
  }, [user, apiRequest]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.role !== 'PATIENT') {
      setError('Chỉ bệnh nhân mới có thể đặt lịch khám.');
      return;
    }
    if (new Date(formData.appointment_time) <= new Date()) {
      setError('Thời gian hẹn phải là trong tương lai.');
      return;
    }
    setFormLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await apiRequest('post', 'http://localhost:8000/api/v1/appointments/', {
        doctor_id: formData.doctor_id,
        patient_id: user.id,
        appointment_time: new Date(formData.appointment_time).toISOString(),
        reason_for_visit: formData.reason_for_visit,
      });
      setAppointments([...appointments, response]);
      setSuccess('Đặt lịch khám thành công!');
      setFormData({ doctor_id: '', appointment_time: '', reason_for_visit: '' });
    } catch (error) {
      setError('Đặt lịch khám thất bại. Vui lòng kiểm tra lại thông tin.');
    }
    setFormLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleViewDetails = async (appointmentId) => {
    setDetailsLoading(true);
    setError('');
    try {
      const details = await apiRequest('get', `http://localhost:8000/api/v1/appointments/${appointmentId}/detail_with_user/`);
      setSelectedAppointment(details);
      setModalOpen(true);
    } catch (error) {
      setError('Không thể tải chi tiết lịch hẹn.');
    }
    setDetailsLoading(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAppointment(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-teal-100">
        <p className="text-teal-600 text-xl">Đang tải...</p>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-teal-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-teal-600 mb-6">Đặt Lịch Khám</h2>

        {/* Appointment Form */}
        {user.role === 'PATIENT' && (
          <div className="bg-white p-6 rounded-2xl shadow-xl mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Tạo Lịch Hẹn Mới</h3>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bác sĩ</label>
                <select
                  name="doctor_id"
                  value={formData.doctor_id}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                  required
                  disabled={formLoading}
                >
                  <option value="">Chọn bác sĩ</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.first_name} {doctor.last_name} ({doctor.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Thời gian hẹn</label>
                <input
                  type="datetime-local"
                  name="appointment_time"
                  value={formData.appointment_time}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                  required
                  disabled={formLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Lý do khám</label>
                <textarea
                  name="reason_for_visit"
                  value={formData.reason_for_visit}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                  required
                  disabled={formLoading}
                />
              </div>
              <button
                type="submit"
                className={`w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-200 ${formLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={formLoading}
              >
                {formLoading ? 'Đang xử lý...' : 'Đặt Lịch'}
              </button>
            </form>
          </div>
        )}

        {/* Appointment List */}
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Danh Sách Lịch Hẹn</h3>
          {appointments.length === 0 ? (
            <p className="text-gray-600">Bạn chưa có lịch hẹn nào.</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border-b pb-4 flex justify-between items-center">
                  <div>
                    <p className="text-gray-700">
                      <span className="font-medium">Thời gian:</span>{' '}
                      {new Date(appointment.appointment_time).toLocaleString()}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Lý do:</span> {appointment.reason_for_visit}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Trạng thái:</span> {appointment.status}
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewDetails(appointment.id)}
                    className="text-teal-600 hover:underline"
                    disabled={detailsLoading}
                  >
                    {detailsLoading && selectedAppointment?.id === appointment.id ? 'Đang tải...' : 'Xem chi tiết'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for Appointment Details */}
        {modalOpen && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-lg w-full">
              <h3 className="text-xl font-semibold text-teal-600 mb-4">Chi Tiết Lịch Hẹn</h3>
              <div className="space-y-4">
                <div>
                  <span className="font-medium text-gray-700">ID Lịch Hẹn:</span> {selectedAppointment.id}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Thời gian:</span>{' '}
                  {new Date(selectedAppointment.appointment_time).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Thời lượng:</span>{' '}
                  {selectedAppointment.duration_minutes} phút
                </div>
                <div>
                  <span className="font-medium text-gray-700">Lý do khám:</span>{' '}
                  {selectedAppointment.reason_for_visit}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Trạng thái:</span>{' '}
                  {selectedAppointment.status}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Ghi chú bệnh nhân:</span>{' '}
                  {selectedAppointment.notes_patient || 'Không có'}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Ghi chú nhân viên:</span>{' '}
                  {selectedAppointment.notes_staff || 'Không có'}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Bệnh nhân:</span>{' '}
                  {selectedAppointment.patient_info.first_name} {selectedAppointment.patient_info.last_name} (
                  {selectedAppointment.patient_info.email})
                </div>
                <div>
                  <span className="font-medium text-gray-700">Bác sĩ:</span>{' '}
                  {selectedAppointment.doctor_info.first_name} {selectedAppointment.doctor_info.last_name} (
                  {selectedAppointment.doctor_info.email})
                </div>
                <div>
                  <span className="font-medium text-gray-700">Ngày tạo:</span>{' '}
                  {new Date(selectedAppointment.created_at).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Ngày cập nhật:</span>{' '}
                  {new Date(selectedAppointment.updated_at).toLocaleString()}
                </div>
              </div>
              <button
                onClick={closeModal}
                className="mt-6 w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-200"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;