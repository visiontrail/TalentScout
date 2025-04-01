import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 获取之前尝试访问的页面路径
  const from = location.state?.from?.pathname || '/dashboard';
  
  useEffect(() => {
    console.log('Login component rendered, auth status:', isAuthenticated);
    
    if (isAuthenticated) {
      console.log('User is already authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const onFinish = async (values: { username: string; password: string }) => {
    console.log('Login attempt with username:', values.username);
    setLoading(true);
    
    try {
      const success = await login(values.username, values.password);
      if (success) {
        console.log('Login successful, redirecting to:', from);
        message.success('登录成功');
        navigate(from, { replace: true });
      } else {
        console.error('Login failed: Invalid credentials');
        message.error('用户名或密码错误');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#f0f2f5' 
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>TalentScout</Title>
          <p>招聘平台信息聚合工具</p>
          <p style={{ fontSize: '12px', color: '#999' }}>
            测试用户: testuser / 密码: password
          </p>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;