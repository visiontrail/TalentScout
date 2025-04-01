import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider, theme } from 'antd';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TaskManagement from './pages/TaskManagement';
import CandidateList from './pages/CandidateList';
import PlatformSettings from './pages/PlatformSettings';
import AppHeader from './components/AppHeader';
import AppSidebar from './components/AppSidebar';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';

const { Content } = Layout;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout style={{ minHeight: '100vh' }}>
                    <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
                    <Layout>
                      <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />
                      <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280 }}>
                        <Routes>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/tasks" element={<TaskManagement />} />
                          <Route path="/candidates" element={<CandidateList />} />
                          <Route path="/settings" element={<PlatformSettings />} />
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                      </Content>
                    </Layout>
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;