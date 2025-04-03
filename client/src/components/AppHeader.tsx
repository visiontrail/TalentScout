import React, { useEffect } from 'react';
import { Layout, Button, Dropdown, Space } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import logger from '../utils/logger';

const { Header } = Layout;

interface AppHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();

  useEffect(() => {
    logger.info('渲染AppHeader组件');
  }, []);

  const menuItems = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: '2',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logger.info('用户点击退出登录');
        logout();
      },
    },
  ];

  return (
    <Header style={{ padding: 0, background: '#fff', display: 'flex', justifyContent: 'space-between' }}>
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{ fontSize: '16px', width: 64, height: 64 }}
      />
      <div style={{ marginRight: 20 }}>
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <Space>
            <Button type="text" icon={<UserOutlined />}>
              {user?.username || '用户'}
            </Button>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;