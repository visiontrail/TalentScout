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

const { Content } = Layout;

// 布局组件
const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  
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

// 路由守卫组件，确保登录状态正确处理
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  console.log("App rendering, authentication status:", isAuthenticated);

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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  console.log("App component initialized");
  
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