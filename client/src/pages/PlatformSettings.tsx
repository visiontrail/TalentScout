import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Tabs, Typography, Spin } from 'antd';
import { SaveOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

interface PlatformCredential {
  username: string;
  password: string;
}

interface PlatformCredentials {
  boss?: PlatformCredential;
  zhilian?: PlatformCredential;
  lagou?: PlatformCredential;
}

const PlatformSettings: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState<PlatformCredentials>({});
  const [bossForm] = Form.useForm();
  const [zhilianForm] = Form.useForm();
  const [lagouForm] = Form.useForm();

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlatformCredentials();
    }
  }, [isAuthenticated]);

  const fetchPlatformCredentials = async () => {
    setLoading(true);
    try {
      // 获取BOSS直聘凭证
      const bossResult = await window.electronAPI.getPlatformCredentials({ platform: 'boss' });
      if (bossResult.success && bossResult.credentials) {
        bossForm.setFieldsValue(bossResult.credentials);
        setCredentials(prev => ({ ...prev, boss: bossResult.credentials }));
      }

      // 获取智联招聘凭证
      const zhilianResult = await window.electronAPI.getPlatformCredentials({ platform: 'zhilian' });
      if (zhilianResult.success && zhilianResult.credentials) {
        zhilianForm.setFieldsValue(zhilianResult.credentials);
        setCredentials(prev => ({ ...prev, zhilian: zhilianResult.credentials }));
      }

      // 获取拉勾网凭证
      const lagouResult = await window.electronAPI.getPlatformCredentials({ platform: 'lagou' });
      if (lagouResult.success && lagouResult.credentials) {
        lagouForm.setFieldsValue(lagouResult.credentials);
        setCredentials(prev => ({ ...prev, lagou: lagouResult.credentials }));
      }
    } catch (error) {
      console.error('获取平台凭证失败:', error);
      message.error('获取平台凭证失败');
    } finally {
      setLoading(false);
    }
  };

  const savePlatformCredential = async (platform: string, values: PlatformCredential) => {
    setSaving(true);
    try {
      const result = await window.electronAPI.savePlatformCredentials({
        platform,
        username: values.username,
        password: values.password,
      });

      if (result.success) {
        message.success(`${getPlatformName(platform)}凭证保存成功`);
        setCredentials(prev => ({ ...prev, [platform]: values }));
      } else {
        message.error(`${getPlatformName(platform)}凭证保存失败: ${result.error}`);
      }
    } catch (error) {
      console.error('保存平台凭证失败:', error);
      message.error('保存平台凭证失败');
    } finally {
      setSaving(false);
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
        在这里配置各招聘平台的登录凭证，系统将使用这些凭证自动登录并爬取候选人信息。
        请确保提供的账号密码正确，并且账号具有搜索和查看简历的权限。
      </Paragraph>

      <Spin spinning={loading}>
        <Tabs defaultActiveKey="boss">
          <TabPane tab="BOSS直聘" key="boss">
            <Card title="BOSS直聘账号设置">
              <Form
                form={bossForm}
                layout="vertical"
                onFinish={(values) => savePlatformCredential('boss', values)}
              >
                <Form.Item
                  name="username"
                  label="账号"
                  rules={[{ required: true, message: '请输入BOSS直聘账号' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="手机号/邮箱" />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="密码"
                  rules={[{ required: true, message: '请输入BOSS直聘密码' }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={saving}
                  >
                    保存凭证
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>

          <TabPane tab="智联招聘" key="zhilian">
            <Card title="智联招聘账号设置">
              <Form
                form={zhilianForm}
                layout="vertical"
                onFinish={(values) => savePlatformCredential('zhilian', values)}
              >
                <Form.Item
                  name="username"
                  label="账号"
                  rules={[{ required: true, message: '请输入智联招聘账号' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="手机号/邮箱" />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="密码"
                  rules={[{ required: true, message: '请输入智联招聘密码' }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={saving}
                  >
                    保存凭证
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>

          <TabPane tab="拉勾网" key="lagou">
            <Card title="拉勾网账号设置">
              <Form
                form={lagouForm}
                layout="vertical"
                onFinish={(values) => savePlatformCredential('lagou', values)}
              >
                <Form.Item
                  name="username"
                  label="账号"
                  rules={[{ required: true, message: '请输入拉勾网账号' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="手机号/邮箱" />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="密码"
                  rules={[{ required: true, message: '请输入拉勾网密码' }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={saving}
                  >
                    保存凭证
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>
        </Tabs>
      </Spin>
    </div>
  );
};

export default PlatformSettings;