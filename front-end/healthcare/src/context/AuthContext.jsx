import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('access_token') || null);
    const [loading, setLoading] = useState(true); // Add loading state

    // Restore user on app load
    useEffect(() => {
        const restoreUser = async () => {
            const storedUserId = localStorage.getItem('user_id');

            if (!storedUserId) {
                console.error('User ID is not found in localStorage');
                setLoading(false);  // Set loading to false to avoid keeping the loader on
                return;  // Dừng hàm nếu không có user_id
            }

            const userId = storedUserId.replace(/"/g, '');  // Remove quotes if stored as a string
            console.log('Restoring user with ID:', userId);

            if (token && storedUserId) {
                try {
                    const response = await axios.get(`http://localhost:8000/api/v1/users/${userId}/`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUser(response.data);
                    localStorage.setItem('user_id', JSON.stringify(response.data.id));
                    console.log('User restored:', response.data);
                } catch (error) {
                    console.error('Failed to restore user:', error);
                    setToken(null);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user_id');
                }
            }
            setLoading(false);
        };
        restoreUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:8000/api/v1/auth/login/', {
                email,
                password,
            });
            setToken(response.data.access);
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            // Fetch user data
            const userResponse = await axios.get('http://localhost:8000/api/v1/users/me/', {
                headers: { Authorization: `Bearer ${response.data.access}` },
            });
            setUser(userResponse.data);
            localStorage.setItem('user_id', JSON.stringify(userResponse.data.id));
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const register = async (userData) => {
        try {
            await axios.post('http://127.0.0.1:8000/api/v1/auth/register/', userData);
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    };

    // Helper for authenticated API calls
    const apiRequest = async (method, url, data = null) => {
        try {
            const config = {
                method,
                url,
                headers: { Authorization: `Bearer ${token}` },
                data,
            };
            const response = await axios(config);
            return response.data;
        } catch (error) {
            console.error(`${method} request failed:`, error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading, apiRequest , setUser}}>
            {children}
        </AuthContext.Provider>
    );
};