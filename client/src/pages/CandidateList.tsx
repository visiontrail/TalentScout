import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Tag, Space, Typography, Spin, Input, Select, Row, Col } from 'antd';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

interface Candidate {
  id: number;
  name: string;
  gender: string;
  age: number;
  education: string;
  experience: string;
  ai_score: number;
  source_platform: string;
  contact: string;
  resume_text: string;
  created_at: string;
}

const CandidateList: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<Candidate | null>(null);
  const [searchText, setSearchText] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');

  useEffect(() => {
    if (isAuthenticated) {
      fetchCandidates();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterCandidates();
  }, [candidates, searchText, platformFilter, scoreFilter]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      // 在实际应用中，这里应该从API获取数据
      // 这里使用模拟数据进行演示
      setTimeout(() => {
        const mockCandidates: Candidate[] = [
          {
            id: 1,
            name: '张三',
            gender: '男',
            age: 28,
            education: '本科，计算机科学，北京大学',
            experience: '5年前端开发经验，熟悉React、Vue等框架',
            ai_score: 92,
            source_platform: 'BOSS直聘',
            contact: '13800138000',
            resume_text: '个人简历：\n姓名：张三\n性别：男\n年龄：28\n教育背景：本科，计算机科学，北京大学\n工作经验：\n1. ABC科技有限公司（2018-2023）- 前端开发工程师\n负责公司核心产品的前端开发，使用React框架...',
            created_at: '2023-04-15 14:30:00',
          },
          {
            id: 2,
            name: '李四',
            gender: '女',
            age: 26,
            education: '硕士，软件工程，清华大学',
            experience: '3年后端开发经验，熟悉Java、Spring Boot',
            ai_score: 85,
            source_platform: '智联招聘',
            contact: '13900139000',
            resume_text: '个人简历：\n姓名：李四\n性别：女\n年龄：26\n教育背景：硕士，软件工程，清华大学\n工作经验：\n1. DEF科技有限公司（2020-2023）- 后端开发工程师\n负责公司核心API的开发和维护，使用Java和Spring Boot...',
            created_at: '2023-04-15 13:45:00',
          },
          {
            id: 3,
            name: '王五',
            gender: '男',
            age: 30,
            education: '本科，计算机科学，上海交通大学',
            experience: '7年全栈开发经验，熟悉React、Node.js',
            ai_score: 78,
            source_platform: '拉勾网',
            contact: '13700137000',
            resume_text: '个人简历：\n姓名：王五\n性别：男\n年龄：30\n教育背景：本科，计算机科学，上海交通大学\n工作经验：\n1. GHI科技有限公司（2016-2023）- 全栈开发工程师\n负责公司产品的前后端开发，使用React和Node.js...',
            created_at: '2023-04-15 11:20:00',
          },
          {
            id: 4,
            name: '赵六',
            gender: '男',
            age: 32,
            education: '硕士，人工智能，中国科学院',
            experience: '5年机器学习工程师经验，熟悉Python、TensorFlow',
            ai_score: 90,
            source_platform: 'BOSS直聘',
            contact: '13600136000',
            resume_text: '个人简历：\n姓名：赵六\n性别：男\n年龄：32\n教育背景：硕士，人工智能，中国科学院\n工作经验：\n1. JKL科技有限公司（2018-2023）- 机器学习工程师\n负责公司AI算法的研发和优化，使用Python和TensorFlow...',
            created_at: '2023-04-15 10:15:00',
          },
        ];
        setCandidates(mockCandidates);
        setFilteredCandidates(mockCandidates);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('获取候选人列表失败:', error);
      setLoading(false);
    }
  };

  const filterCandidates = () => {
    let filtered = [...candidates];

    // 搜索过滤
    if (searchText) {
      filtered = filtered.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(searchText.toLowerCase()) ||
          candidate.experience.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 平台过滤
    if (platformFilter !== 'all') {
      filtered = filtered.filter((candidate) => candidate.source_platform === platformFilter);
    }

    // 分数过滤
    if (scoreFilter !== 'all') {
      switch (scoreFilter) {
        case 'high':
          filtered = filtered.filter((candidate) => candidate.ai_score >= 90);
          break;
        case 'medium':
          filtered = filtered.filter((candidate) => candidate.ai_score >= 75 && candidate.ai_score < 90);
          break;
        case 'low':
          filtered = filtered.filter((candidate) => candidate.ai_score < 75);
          break;
      }
    }

    setFilteredCandidates(filtered);
  };

  const showCandidateDetail = (candidate: Candidate) => {
    setCurrentCandidate(candidate);
    setDetailModalVisible(true);
  };

  const exportToExcel = async () => {
    try {
      // 在实际应用中，这里应该调用Electron API导出Excel
      // 这里只是模拟
      window.electronAPI.exportExcel({ data: filteredCandidates })
        .then((result: any) => {
          if (result.success) {
            console.log('导出成功，文件路径:', result.filePath);
          } else {
            console.error('导出失败:', result.error);
          }
        });
    } catch (error) {
      console.error('导出Excel失败:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#3f8600';
    if (score >= 75) return '#faad14';
    return '#cf1322';
  };

  const getScoreTag = (score: number) => {
    if (score >= 90) return <Tag color="success">优秀</Tag>;
    if (score >= 75) return <Tag color="warning">良好</Tag>;
    return <Tag color="error">一般</Tag>;
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '教育背景',
      dataIndex: 'education',
      key: 'education',
      ellipsis: true,
    },
    {
      title: '工作经验',
      dataIndex: 'experience',
      key: 'experience',
      ellipsis: true,
    },
    {
      title: 'AI评分',
      dataIndex: 'ai_score',
      key: 'ai_score',
      sorter: (a: Candidate, b: Candidate) => a.ai_score - b.ai_score,
      render: (score: number) => (
        <span style={{ color: getScoreColor(score) }}>
          {score} {getScoreTag(score)}
        </span>
      ),
    },
    {
      title: '来源平台',
      dataIndex: 'source_platform',
      key: 'source_platform',
    },
    {
      title: '添加时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Candidate) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => showCandidateDetail(record)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  // 获取所有平台列表（用于过滤）
  const platforms = Array.from(new Set(candidates.map((c) => c.source_platform)));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>候选人列表</Title>
        <Button type="primary" icon={<DownloadOutlined />} onClick={exportToExcel}>
          导出Excel
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Search
            placeholder="搜索姓名或经验"
            allowClear
            enterButton
            onSearch={(value) => setSearchText(value)}
          />
        </Col>
        <Col span={8}>
          <Select
            style={{ width: '100%' }}
            placeholder="按平台筛选"
            value={platformFilter}
            onChange={(value) => setPlatformFilter(value)}
          >
            <Option value="all">全部平台</Option>
            {platforms.map((platform) => (
              <Option key={platform} value={platform}>
                {platform}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <Select
            style={{ width: '100%' }}
            placeholder="按评分筛选"
            value={scoreFilter}
            onChange={(value) => setScoreFilter(value)}
          >
            <Option value="all">全部评分</Option>
            <Option value="high">优秀 (≥90)</Option>
            <Option value="medium">良好 (75-89)</Option>
            <Option value="low">一般 (<75)</Option>
          </Select>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Table columns={columns} dataSource={filteredCandidates} rowKey="id" />
      </Spin>

      <Modal
        title="候选人详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {currentCandidate && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>姓名：</Text> {currentCandidate.name}
              </Col>
              <Col span={6}>
                <Text strong>性别：</Text> {currentCandidate.gender}
              </Col>
              <Col span={6}>
                <Text strong>年龄：</Text> {currentCandidate.age}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Text strong>联系方式：</Text> {currentCandidate.contact}
              </Col>
              <Col span={12}>
                <Text strong>来源平台：</Text> {currentCandidate.source_platform}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Text strong>教育背景：</Text>
                <Paragraph>{currentCandidate.education}</Paragraph>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Text strong>工作经验：</Text>
                <Paragraph>{currentCandidate.experience}</Paragraph>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Text strong>AI评分：</Text>
                <span style={{ color: getScoreColor(currentCandidate.ai_score) }}>
                  {currentCandidate.ai_score} {getScoreTag(currentCandidate.ai_score)}
                </span>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Text strong>简历原文：</Text>
                <div
                  style={{
                    marginTop: 8,
                    padding: 16,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 4,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {currentCandidate.resume_text}
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CandidateList;