import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  subscription_level: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      // 设置axios默认请求头
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // 获取用户信息
      fetchUserInfo();
    } else {
      // 清除axios默认请求头
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/users/me');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      logout();
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // 使用FormData格式发送请求，符合OAuth2的要求
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await axios.post('http://localhost:8000/api/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};