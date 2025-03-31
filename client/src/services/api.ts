/**
 * API服务模块
 * 提供与服务端API交互的方法
 */

import axios from 'axios';

// API基础URL
const API_BASE_URL = 'http://localhost:8000/api';

// 设置axios默认配置
axios.defaults.baseURL = API_BASE_URL;

// 请求拦截器，添加token到请求头
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器，处理错误
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // 如果是401错误，可能是token过期，清除本地token并重定向到登录页
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 用户相关API
export const userApi = {
  // 登录
  login: async (username: string, password: string) => {
    const response = await axios.post('/login', { username, password });
    return response.data;
  },
  
  // 注册
  register: async (username: string, email: string, password: string) => {
    const response = await axios.post('/users', { username, email, password });
    return response.data;
  },
  
  // 获取当前用户信息
  getCurrentUser: async () => {
    const response = await axios.get('/users/me');
    return response.data;
  },
  
  // 更新密码
  updatePassword: async (currentPassword: string, newPassword: string) => {
    const response = await axios.put('/users/me/password', { current_password: currentPassword, new_password: newPassword });
    return response.data;
  }
};

// 任务相关API
export const taskApi = {
  // 获取任务列表
  getTasks: async () => {
    const response = await axios.get('/tasks');
    return response.data;
  },
  
  // 创建任务
  createTask: async (taskName: string, jobDescription: string) => {
    const response = await axios.post('/tasks', { task_name: taskName, job_description: jobDescription });
    return response.data;
  },
  
  // 更新任务
  updateTask: async (taskId: number, taskName: string, jobDescription: string) => {
    const response = await axios.put(`/tasks/${taskId}`, { task_name: taskName, job_description: jobDescription });
    return response.data;
  },
  
  // 删除任务
  deleteTask: async (taskId: number) => {
    const response = await axios.delete(`/tasks/${taskId}`);
    return response.data;
  },
  
  // 获取任务详情
  getTaskDetail: async (taskId: number) => {
    const response = await axios.get(`/tasks/${taskId}`);
    return response.data;
  }
};

// 候选人相关API
export const candidateApi = {
  // 获取候选人列表
  getCandidates: async (taskId: number) => {
    const response = await axios.get(`/tasks/${taskId}/candidates`);
    return response.data;
  },
  
  // 添加候选人
  addCandidate: async (taskId: number, candidateData: any) => {
    const response = await axios.post(`/tasks/${taskId}/candidates`, candidateData);
    return response.data;
  },
  
  // 批量添加候选人
  addCandidatesBatch: async (taskId: number, candidatesData: any[]) => {
    const response = await axios.post(`/tasks/${taskId}/candidates/batch`, { candidates: candidatesData });
    return response.data;
  },
  
  // 获取候选人详情
  getCandidateDetail: async (candidateId: number) => {
    const response = await axios.get(`/candidates/${candidateId}`);
    return response.data;
  },
  
  // 删除候选人
  deleteCandidate: async (candidateId: number) => {
    const response = await axios.delete(`/candidates/${candidateId}`);
    return response.data;
  }
};

// AI相关API
export const aiApi = {
  // 获取AI API密钥
  getAiKey: async () => {
    const response = await axios.get('/ai/key');
    return response.data;
  },
  
  // 评分简历
  scoreResume: async (jobDescription: string, resumeText: string) => {
    const response = await axios.post('/ai/score-resume', { job_description: jobDescription, resume_text: resumeText });
    return response.data;
  },
  
  // 批量评分简历
  batchScoreResumes: async (jobDescription: string, resumeTexts: string[]) => {
    const response = await axios.post('/ai/batch-score-resumes', { job_description: jobDescription, resume_texts: resumeTexts });
    return response.data;
  }
};