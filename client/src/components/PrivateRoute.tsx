import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // 添加调试日志
  useEffect(() => {
    console.log('PrivateRoute rendered, auth status:', isAuthenticated);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    // 如果用户未认证，重定向到登录页面，并记住当前尝试访问的路径
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果用户已认证，渲染子组件
  console.log('User authenticated, rendering protected content');
  return <>{children}</>;
};

export default PrivateRoute;