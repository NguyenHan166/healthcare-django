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
      {/* Sidebar */}
      <div className="w-64 bg-teal-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-8 text-center">Healthcare System</h2>
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
          <Link
            to="/chatbot"
            className="block py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-200"
          >
            HealthCare Chatbot
          </Link>


          {(user.role === 'DOCTOR' || user.role === 'PATIENT') && (
            <Link
              to="/patient-records"
              className="block py-2 px-4 rounded-lg hover:bg-teal-700 transition duration-200"
            >
              Bệnh án
            </Link>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-6">
        {/* Welcome Section */}
        <h1 className="text-3xl font-bold text-teal-600 mb-6">Chào mừng, {user.first_name} {user.last_name}!</h1>
        <p className="text-gray-600">Chọn một chức năng từ menu bên trái để bắt đầu.</p>

        {/* Image Section */}
        <div className="flex justify-center mb-8">
          <img
            src="https://hiu.vn/wp-content/uploads/2022/08/IMG_0930-1024x683.jpg" // Thay thế bằng URL hình ảnh của bác sĩ tận tình
            alt="Bác sĩ chăm sóc bệnh nhân"
            className="w-full max-w-md rounded-lg shadow-lg mr-6"
          />
          <img
            src="https://hiu.vn/wp-content/uploads/2022/08/IMG_0930-1024x683.jpg" // Thay thế bằng URL hình ảnh của bác sĩ tận tình
            alt="Bác sĩ chăm sóc bệnh nhân"
            className="w-full max-w-md rounded-lg shadow-lg"
          />
        </div>

        {/* Inspirational Quotes */}
        <div className="bg-teal-50 p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-teal-600 mb-4">Phương châm ngành Y</h3>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>"Cứu người là sứ mệnh, mang lại hy vọng là niềm vui." – Lời dạy của bác sĩ</li>
            <li>"Chúng ta không chỉ chữa bệnh, mà còn phải chữa tâm hồn." – Chuyên gia y tế</li>
            <li>"Mỗi bệnh nhân là một câu chuyện, hãy lắng nghe trước khi điều trị." – Từ trái tim của bác sĩ</li>
            <li>"Sự tận tâm là chìa khóa trong hành trình chữa lành." – Triết lý y khoa</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
