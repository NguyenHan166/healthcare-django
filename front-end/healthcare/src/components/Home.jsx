import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const { user, loading } = useContext(AuthContext);
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

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-teal-100 flex">
      <div className="w-64 bg-teal-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-8">Healthcare System</h2>
        <nav className="space-y-4">
          <Link
            to="/profile"
            className="block py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-200"
          >
            Hồ Sơ
          </Link>
          <Link
            to="/appointments"
            className="block py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-200"
          >
            Đặt Lịch Khám
          </Link>

          {(user.role === 'DOCTOR' || user.role === 'PATIENT') && (
            <Link
              to="/patient-records"
              className="block py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-200"
            >
              Hồ Sơ Bệnh Nhân
            </Link>
          )}

        </nav>
      </div>
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-teal-600 mb-6">Chào mừng, {user.first_name} {user.last_name}!</h1>
        <p className="text-gray-600">Chọn một chức năng từ menu bên trái để bắt đầu.</p>
      </div>
    </div>
  );
};

export default Home;