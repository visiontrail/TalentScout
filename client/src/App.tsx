import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout, ConfigProvider, theme } from 'antd';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TaskManagement from './pages/TaskManagement';
import CandidateList from './pages/CandidateList';
import PlatformSettings from './pages/PlatformSettings';
import AppHeader from './components/AppHeader';
import AppSidebar from './components/AppSidebar';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import logger from './utils/logger';

const { Content } = Layout;

// 布局组件
const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  
  useEffect(() => {
    logger.info('渲染AppLayout组件');
  }, []);
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

// 简单的首页组件
const HomePage = () => {
  useEffect(() => {
    logger.info('渲染HomePage组件');
  }, []);
  
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>欢迎使用TalentScout</h1>
      <p>请点击左侧菜单导航到不同功能</p>
    </div>
  );
};

// 路由守卫组件，确保登录状态正确处理
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  console.log("App rendering, authentication status:", isAuthenticated);
  logger.info(`渲染AppRoutes组件, 认证状态: ${isAuthenticated}`);

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      
      <Route element={
        <PrivateRoute>
          <AppLayout />
        </PrivateRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskManagement />} />
        <Route path="/candidates" element={<CandidateList />} />
        <Route path="/settings" element={<PlatformSettings />} />
        <Route index element={<HomePage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  console.log("App component initialized");
  logger.info("App组件初始化");
  
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
};

export default App;