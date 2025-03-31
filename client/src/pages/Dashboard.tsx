import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Spin } from 'antd';
import { TeamOutlined, FileSearchOutlined, RiseOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

interface TaskSummary {
  total: number;
  active: number;
  completed: number;
}

interface CandidateSummary {
  total: number;
  highScore: number;
  newToday: number;
}

interface RecentCandidate {
  id: number;
  name: string;
  source_platform: string;
  ai_score: number;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [taskSummary, setTaskSummary] = useState<TaskSummary>({ total: 0, active: 0, completed: 0 });
  const [candidateSummary, setCandidateSummary] = useState<CandidateSummary>({
    total: 0,
    highScore: 0,
    newToday: 0,
  });
  const [recentCandidates, setRecentCandidates] = useState<RecentCandidate[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 在实际应用中，这里应该从API获取数据
      // 这里使用模拟数据进行演示
      setTimeout(() => {
        setTaskSummary({
          total: 12,
          active: 5,
          completed: 7,
        });

        setCandidateSummary({
          total: 87,
          highScore: 23,
          newToday: 8,
        });

        setRecentCandidates([
          {
            id: 1,
            name: '张三',
            source_platform: 'BOSS直聘',
            ai_score: 92,
            created_at: '2023-04-15 14:30:00',
          },
          {
            id: 2,
            name: '李四',
            source_platform: '智联招聘',
            ai_score: 85,
            created_at: '2023-04-15 13:45:00',
          },
          {
            id: 3,
            name: '王五',
            source_platform: '拉勾网',
            ai_score: 78,
            created_at: '2023-04-15 11:20:00',
          },
          {
            id: 4,
            name: '赵六',
            source_platform: 'BOSS直聘',
            ai_score: 90,
            created_at: '2023-04-15 10:15:00',
          },
        ]);

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '来源平台',
      dataIndex: 'source_platform',
      key: 'source_platform',
    },
    {
      title: 'AI评分',
      dataIndex: 'ai_score',
      key: 'ai_score',
      render: (score: number) => {
        let color = score >= 90 ? '#3f8600' : score >= 75 ? '#faad14' : '#cf1322';
        return <span style={{ color }}>{score}</span>;
      },
    },
    {
      title: '添加时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
  ];

  return (
    <div>
      <Title level={2}>仪表盘</Title>
      <Spin spinning={loading}>
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="任务总数"
                value={taskSummary.total}
                prefix={<FileSearchOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="候选人总数"
                value={candidateSummary.total}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="高分候选人"
                value={candidateSummary.highScore}
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 24 }}>
          <Title level={4}>最近添加的候选人</Title>
          <Table
            columns={columns}
            dataSource={recentCandidates}
            rowKey="id"
            pagination={false}
          />
        </div>
      </Spin>
    </div>
  );
};

export default Dashboard;