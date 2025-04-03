import React, { useState, useEffect } from 'react';
import { Card, Button, message, Tabs, Typography, Spin, Space } from 'antd';
import { LoginOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import logger from '../utils/logger';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const PlatformSettings: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loggingIn, setLoggingIn] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      // 初始化平台设置
      logger.info('平台设置页面初始化');
    }
  }, [isAuthenticated]);

  const loginPlatform = async (platform: string) => {
    logger.info(`开始登录平台: ${platform}`);
    setLoggingIn(platform);
    try {
      // 调用Electron API启动浏览器进行登录
      logger.info(`正在启动浏览器进行${getPlatformName(platform)}登录...`);
      const result = await window.electronAPI.loginPlatform({ platform });
      
      if (result.success) {
        logger.info(`${getPlatformName(platform)}登录成功!`);
        message.success(`${getPlatformName(platform)}登录成功！`);
      } else {
        logger.error(`${getPlatformName(platform)}登录失败: ${result.error}`);
        message.error(`${getPlatformName(platform)}登录失败: ${result.error}`);
      }
    } catch (error) {
      logger.error(`登录平台失败: ${error}`);
      console.error('登录平台失败:', error);
      message.error('登录平台失败，请稍后重试');
    } finally {
      setLoggingIn(null);
    }
  };

  const getPlatformName = (platform: string): string => {
    switch (platform) {
      case 'boss':
        return 'BOSS直聘';
      case 'zhilian':
        return '智联招聘';
      case 'lagou':
        return '拉勾网';
      default:
        return '未知平台';
    }
  };

  return (
    <div>
      <Title level={2}>平台设置</Title>
      <Paragraph>
        在这里配置各招聘平台的登录信息。系统将启动浏览器让您直接登录招聘平台，并在爬取过程中使用您的登录状态。
      </Paragraph>

      <Spin spinning={loading}>
        <Tabs defaultActiveKey="boss">
          <TabPane tab="BOSS直聘" key="boss">
            <Card title="BOSS直聘账号设置">
              <Paragraph>
                点击下方按钮启动浏览器，在浏览器中登录您的BOSS直聘账号。系统将保存登录状态用于爬取候选人信息。
              </Paragraph>
              <Space>
                <Button
                  type="primary"
                  icon={<LoginOutlined />}
                  loading={loggingIn === 'boss'}
                  onClick={() => loginPlatform('boss')}
                >
                  启动浏览器登录
                </Button>
              </Space>
            </Card>
          </TabPane>

          <TabPane tab="智联招聘" key="zhilian">
            <Card title="智联招聘账号设置">
              <Paragraph>
                点击下方按钮启动浏览器，在浏览器中登录您的智联招聘账号。系统将保存登录状态用于爬取候选人信息。
              </Paragraph>
              <Space>
                <Button
                  type="primary"
                  icon={<LoginOutlined />}
                  loading={loggingIn === 'zhilian'}
                  onClick={() => loginPlatform('zhilian')}
                >
                  启动浏览器登录
                </Button>
              </Space>
            </Card>
          </TabPane>

          <TabPane tab="拉勾网" key="lagou">
            <Card title="拉勾网账号设置">
              <Paragraph>
                点击下方按钮启动浏览器，在浏览器中登录您的拉勾网账号。系统将保存登录状态用于爬取候选人信息。
              </Paragraph>
              <Space>
                <Button
                  type="primary"
                  icon={<LoginOutlined />}
                  loading={loggingIn === 'lagou'}
                  onClick={() => loginPlatform('lagou')}
                >
                  启动浏览器登录
                </Button>
              </Space>
            </Card>
          </TabPane>
        </Tabs>
      </Spin>
    </div>
  );
};

export default PlatformSettings;