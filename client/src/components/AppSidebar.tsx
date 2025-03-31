import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  FileSearchOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  
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
      onCollapse={setCollapsed}
      style={{ background: '#001529' }}
    >
      <div className="logo">TalentScout</div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
      />
    </Sider>
  );
};

export default AppSidebar;