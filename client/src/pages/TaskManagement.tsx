import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Typography, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import logger from '../utils/logger';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Task {
  id: number;
  task_name: string;
  job_description: string;
  created_at: string;
  updated_at: string;
  candidate_count: number;
}

const TaskManagement: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('创建任务');
  const [form] = Form.useForm();
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // 在实际应用中，这里应该从API获取数据
      // 这里使用模拟数据进行演示
      setTimeout(() => {
        setTasks([
          {
            id: 1,
            task_name: '前端开发工程师招聘',
            job_description: '负责公司产品的前端开发，要求熟悉React、Vue等前端框架...',
            created_at: '2023-04-10 09:30:00',
            updated_at: '2023-04-10 09:30:00',
            candidate_count: 12,
          },
          {
            id: 2,
            task_name: '后端开发工程师招聘',
            job_description: '负责公司产品的后端开发，要求熟悉Java、Spring Boot等技术...',
            created_at: '2023-04-12 14:20:00',
            updated_at: '2023-04-12 14:20:00',
            candidate_count: 8,
          },
          {
            id: 3,
            task_name: '产品经理招聘',
            job_description: '负责公司产品的规划和设计，要求有3年以上产品经理经验...',
            created_at: '2023-04-14 11:15:00',
            updated_at: '2023-04-14 11:15:00',
            candidate_count: 5,
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('获取任务列表失败:', error);
      setLoading(false);
    }
  };

  const showCreateModal = () => {
    setModalTitle('创建任务');
    setEditingTaskId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (task: Task) => {
    setModalTitle('编辑任务');
    setEditingTaskId(task.id);
    form.setFieldsValue({
      task_name: task.task_name,
      job_description: task.job_description,
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingTaskId) {
        // 编辑任务
        // 在实际应用中，这里应该调用API更新任务
        const updatedTasks = tasks.map(task => {
          if (task.id === editingTaskId) {
            return {
              ...task,
              task_name: values.task_name,
              job_description: values.job_description,
              updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            };
          }
          return task;
        });
        setTasks(updatedTasks);
        message.success('任务更新成功');
      } else {
        // 创建任务
        // 在实际应用中，这里应该调用API创建任务
        const newTask: Task = {
          id: Math.max(...tasks.map(t => t.id), 0) + 1,
          task_name: values.task_name,
          job_description: values.job_description,
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
          updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
          candidate_count: 0,
        };
        setTasks([...tasks, newTask]);
        message.success('任务创建成功');
      }
      
      setModalVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleDelete = (taskId: number) => {
    // 在实际应用中，这里应该调用API删除任务
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    message.success('任务删除成功');
  };

  const startCrawler = async (taskId: number, taskName: string, jobDescription: string) => {
    try {
      logger.info(`开始为任务 "${taskName}" 启动爬虫`);
      message.info(`正在为任务 "${taskName}" 启动爬虫，请稍候...`);
      
      // 1. 首先获取服务器返回的API-Key
      let apiKeyResponse;
      try {
        logger.info(`正在获取API密钥...`);
        // 判断当前是开发环境还是生产环境
        const isDev = process.env.NODE_ENV === 'development';
        const baseUrl = isDev ? 'http://localhost:8000' : '';
        logger.info(`当前环境: ${isDev ? '开发环境' : '生产环境'}, 基础URL: ${baseUrl}`);
        
        const response = await axios.get(`${baseUrl}/api/ai/key`);
        apiKeyResponse = response.data;
        logger.info(`成功获取API密钥: ${JSON.stringify(apiKeyResponse)}`);
      } catch (error) {
        logger.error(`获取API密钥失败: ${error}`);
        logger.info(`尝试直接使用固定API密钥作为备选方案`);
        // 如果无法获取API密钥，直接使用固定的DeepSeek API密钥
        apiKeyResponse = { temp_token: 'sk-pbxwzbwsubwzmtsfusculgwzypxivjxdtvwuioxfemsejyrf' };
        logger.info(`使用固定API密钥: ${apiKeyResponse.temp_token}`);
        console.error('获取API密钥失败:', error);
        message.info('使用备用API密钥继续操作');
      }

      // 2. 调用MCP Server来处理爬虫任务
      try {
        logger.info(`开始启动MCP爬虫...`);
        const result = await window.electronAPI.startMcpCrawler({
          taskName,
          jobDescription,
          apiKey: apiKeyResponse.temp_token
        });

        if (result.success) {
          logger.info(`爬虫任务成功完成: ${JSON.stringify(result)}`);
          message.success(`爬虫任务已完成，已找到 ${result.candidates?.length || 0} 位候选人`);
        } else {
          logger.error(`爬虫任务失败: ${result.error}`);
          message.error(`爬虫任务失败: ${result.error}`);
        }
      } catch (error) {
        logger.error(`MCP爬虫执行失败: ${error}`);
        console.error('MCP爬虫执行失败:', error);
        message.error('爬虫执行失败，请检查平台设置并重试');
      }
    } catch (error) {
      logger.error(`启动爬虫失败: ${error}`);
      console.error('启动爬虫失败:', error);
      message.error('启动爬虫失败，请稍后重试');
    }
  };

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'task_name',
      key: 'task_name',
    },
    {
      title: '职位描述',
      dataIndex: 'job_description',
      key: 'job_description',
      ellipsis: true,
    },
    {
      title: '候选人数量',
      dataIndex: 'candidate_count',
      key: 'candidate_count',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Task) => (
        <Space size="middle">
          <Button 
            type="primary" 
            size="small" 
            onClick={() => startCrawler(record.id, record.task_name, record.job_description)}
          >
            启动爬虫
          </Button>
          <Button 
            type="default" 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="确定要删除这个任务吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="default" 
              danger 
              size="small" 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>任务管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
          创建任务
        </Button>
      </div>
      
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={tasks} rowKey="id" />
      </Spin>

      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="task_name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Form.Item
            name="job_description"
            label="职位描述"
            rules={[{ required: true, message: '请输入职位描述' }]}
          >
            <TextArea rows={6} placeholder="请输入详细的职位描述，包括职责、要求等" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskManagement;