import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const { user, logout, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsOpen(false);
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    if (loading) return null;

    const isActive = (path) => location.pathname === path ? 'bg-teal-700 text-white' : 'text-white hover:bg-teal-700';

    return (
        <nav className="bg-teal-600 p-4 fixed w-full top-0 z-10 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link to={user ? '/home' : '/'} className="text-white text-xl font-bold flex items-center space-x-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Healthcare System</span>
                </Link>

                {/* Hamburger Button for Mobile */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden text-white focus:outline-none"
                    aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
                >
                    {isOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    )}
                </button>

                {/* Navigation Links */}
                <div className={`md:flex md:items-center md:space-x-4 ${isOpen ? 'block' : 'hidden'} absolute md:static top-16 left-0 w-full md:w-auto bg-teal-600 md:bg-transparent p-4 md:p-0 transition-all duration-300`}>
                    {user ? (
                        <>
                            <Link
                                to="/home"
                                className={`block py-2 px-4 rounded-lg ${isActive('/home')} transition duration-200 md:inline-block`}
                                onClick={() => setIsOpen(false)}
                            >
                                Trang Chủ
                            </Link>
                            <Link
                                to="/profile"
                                className={`block py-2 px-4 rounded-lg ${isActive('/profile')} transition duration-200 md:inline-block`}
                                onClick={() => setIsOpen(false)}
                            >
                                Hồ Sơ
                            </Link>
                            <Link
                                to="/appointments"
                                className={`block py-2 px-4 rounded-lg ${isActive('/appointments')} transition duration-200 md:inline-block`}
                                onClick={() => setIsOpen(false)}
                            >
                                Đặt Lịch Khám
                            </Link>
                            {(user.role === 'DOCTOR' || user.role === 'PATIENT') && (
                                <Link to="/patient-records" className={`block py-2 px-4 rounded-lg ${isActive('/patient-records')} transition duration-200 md:inline-block`}>
                                    Hồ Sơ Bệnh Nhân
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="block py-2 px-4 text-white hover:bg-teal-700 rounded-lg transition duration-200 md:inline-block w-full md:w-auto text-left"
                            >
                                Đăng Xuất
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className={`block py-2 px-4 rounded-lg ${isActive('/login')} transition duration-200 md:inline-block`}
                                onClick={() => setIsOpen(false)}
                            >
                                Đăng Nhập
                            </Link>
                            <Link
                                to="/register"
                                className={`block py-2 px-4 rounded-lg ${isActive('/register')} transition duration-200 md:inline-block`}
                                onClick={() => setIsOpen(false)}
                            >
                                Đăng Ký
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;