import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logger from '../utils/logger';

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
  // 临时解决方案：默认设置为已认证状态
  const [user, setUser] = useState<User | null>({
    id: 1,
    username: 'temp_user',
    email: 'temp@example.com',
    subscription_level: 'basic'
  });
  const [token, setToken] = useState<string | null>('temp_token');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const navigate = useNavigate();

  // 添加日志记录
  useEffect(() => {
    logger.info(`认证状态初始化: isAuthenticated=${isAuthenticated}`);
  }, []);

  useEffect(() => {
    if (token) {
      // 设置axios默认请求头
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // 获取用户信息
      // 临时关闭获取用户信息
      // fetchUserInfo();
    } else {
      // 清除axios默认请求头
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const fetchUserInfo = async () => {
    try {
      logger.info('尝试获取用户信息');
      const response = await axios.get('http://localhost:8000/api/users/me');
      setUser(response.data);
      setIsAuthenticated(true);
      logger.info('成功获取用户信息');
    } catch (error) {
      logger.error(`获取用户信息失败: ${error}`);
      console.error('获取用户信息失败:', error);
      logout();
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      logger.info(`尝试登录: ${username}`);
      
      // 开发环境下的临时解决方案：直接认为登录成功
      if (process.env.NODE_ENV === 'development') {
        logger.info(`开发环境，自动登录成功`);
        const mockToken = 'mock_token_for_development';
        localStorage.setItem('token', mockToken);
        setToken(mockToken);
        setUser({
          id: 1,
          username,
          email: 'dev@example.com',
          subscription_level: 'basic'
        });
        setIsAuthenticated(true);
        return true;
      }
      
      // 正常登录流程
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
      logger.info('登录成功');
      return true;
    } catch (error) {
      logger.error(`登录失败: ${error}`);
      console.error('登录失败:', error);
      return false;
    }
  };

  const logout = () => {
    logger.info('用户注销');
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