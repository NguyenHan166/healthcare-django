import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout, loading, apiRequest, setUser } = useContext(AuthContext);
  const [updatedUser, setUpdatedUser] = useState({ ...user });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await apiRequest('put', `http://localhost:8000/api/v1/users/${user.id}/`, updatedUser);
      if (response) {
        setUser(updatedUser);
        alert('Cập nhật thông tin thành công!');
      } else {
        alert('Cập nhật thông tin thất bại!');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-teal-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-teal-600 mb-6 text-center">Hồ Sơ Người Dùng</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="flex items-center space-x-4">
            <label className="text-gray-600 font-medium w-1/4">Họ Tên:</label>
            <input
              type="text"
              name="first_name"
              value={updatedUser.first_name}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-md w-1/2 focus:ring-2 focus:ring-teal-500"
              placeholder="Nhập họ"
            />
            <input
              type="text"
              name="last_name"
              value={updatedUser.last_name}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-md w-1/2 focus:ring-2 focus:ring-teal-500"
              placeholder="Nhập tên"
            />
          </div>

          {/* Email */}
          <div className="flex items-center space-x-4">
            <label className="text-gray-600 font-medium w-1/4">Email:</label>
            <input
              type="email"
              name="email"
              value={updatedUser.email}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-teal-500"
              placeholder="Nhập email"
            />
          </div>

          {/* Role */}
          <div className="flex items-center space-x-4">
            <label className="text-gray-600 font-medium w-1/4">Vai trò:</label>
            <span className="w-3/4">{user.role === 'PATIENT' ? 'Bệnh nhân' : user.role === 'DOCTOR' ? 'Bác sĩ' : 'Y tá'}</span>
          </div>

          {/* Date of Birth */}
          <div className="flex items-center space-x-4">
            <label className="text-gray-600 font-medium w-1/4">Ngày sinh:</label>
            <input
              type="date"
              name="date_of_birth"
              value={updatedUser.date_of_birth}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Gender */}
          <div className="flex items-center space-x-4">
            <label className="text-gray-600 font-medium w-1/4">Giới tính:</label>
            <input
              type="text"
              name="gender"
              value={updatedUser.gender || ''}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-teal-500"
              placeholder="Nhập giới tính"
            />
          </div>

          {/* Address */}
          <div className="flex items-center space-x-4">
            <label className="text-gray-600 font-medium w-1/4">Địa chỉ:</label>
            <input
              type="text"
              name="address"
              value={updatedUser.address || ''}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-teal-500"
              placeholder="Nhập địa chỉ"
            />
          </div>

          {/* Active status */}
          <div className="flex items-center space-x-4">
            <label className="text-gray-600 font-medium w-1/4">Trạng thái:</label>
            <span className="w-3/4">{updatedUser.is_active ? 'Hoạt động' : 'Không hoạt động'}</span>
          </div>

          {/* Created and Updated Dates */}
          <div className="flex items-center space-x-4">
            <label className="text-gray-600 font-medium w-1/4">Ngày tạo:</label>
            <span className="w-3/4">{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-gray-600 font-medium w-1/4">Ngày cập nhật:</label>
            <span className="w-3/4">{new Date(user.updated_at).toLocaleDateString()}</span>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="mt-6 bg-blue-600 text-white py-2 px-8 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Cập Nhật
            </button>
          </div>
        </form>

        {/* Logout Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 px-8 rounded-lg hover:bg-red-700 transition duration-200"
          >
            Đăng Xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
