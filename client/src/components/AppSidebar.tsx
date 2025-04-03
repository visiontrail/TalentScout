import React, { useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  FileSearchOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import logger from '../utils/logger';

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  
  useEffect(() => {
    logger.info(`渲染AppSidebar组件, 当前路径: ${location.pathname}`);
  }, [location.pathname]);
  
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">仪表盘</Link>,
    },
    {
      key: '/tasks',
      icon: <FileSearchOutlined />,
      label: <Link to="/tasks">任务管理</Link>,
    },
    {
      key: '/candidates',
      icon: <TeamOutlined />,
      label: <Link to="/candidates">候选人列表</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">平台设置</Link>,
    },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => {
        logger.info(`侧边栏折叠状态切换: ${value ? '折叠' : '展开'}`);
        setCollapsed(value);
      }}
      style={{ background: '#001529' }}
    >
      <div style={{ 
        height: '64px', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        fontSize: collapsed ? '14px' : '18px',
        fontWeight: 'bold',
        overflow: 'hidden'
      }}>
        {collapsed ? 'TS' : 'TalentScout'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={(e) => {
          logger.info(`菜单项点击: ${e.key}`);
        }}
      />
    </Sider>
  );
};

export default AppSidebar;