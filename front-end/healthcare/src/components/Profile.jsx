import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-teal-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-teal-600 mb-6">Hồ Sơ Người Dùng</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 font-medium">Họ Tên:</span>
            <span>{user.first_name} {user.last_name}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 font-medium">Email:</span>
            <span>{user.email}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 font-medium">Vai trò:</span>
            <span>{user.role === 'PATIENT' ? 'Bệnh nhân' : user.role === 'DOCTOR' ? 'Bác sĩ' : 'Y tá'}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 font-medium">Ngày tạo:</span>
            <span>{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-8 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200"
        >
          Đăng Xuất
        </button>
      </div>
    </div>
  );
};

export default Profile;