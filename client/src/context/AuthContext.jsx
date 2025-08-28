// client/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Set up axios interceptor to include token in requests
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Verify token and get user info
            fetchUserProfile();
        } else {
            delete axios.defaults.headers.common['Authorization'];
            setLoading(false);
        }
    }, [token]);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get('/api/auth/profile');
            if (response.data.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            logout(); // Invalid token, logout user
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await axios.post('/api/auth/login', credentials);
            
            if (response.data.success) {
                const { token, user } = response.data;
                
                // Store token in localStorage
                localStorage.setItem('token', token);
                setToken(token);
                setUser(user);
                
                // Set default axios header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                return { success: true, user };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            return { success: false, message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('/api/auth/register', userData);
            
            if (response.data.success) {
                const { token, user } = response.data;
                
                // Store token in localStorage
                localStorage.setItem('token', token);
                setToken(token);
                setUser(user);
                
                // Set default axios header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                return { success: true, user };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            const errors = error.response?.data?.errors || [];
            return { success: false, message, errors };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const isAuthenticated = () => {
        return !!token && !!user;
    };

    const hasRole = (role) => {
        return user && user.user_type === role;
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        hasRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};