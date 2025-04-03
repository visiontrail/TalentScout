# TalentScout - 招聘平台信息聚合工具

## 项目概述

TalentScout是一个聚合招聘平台信息的工具，能够根据用户所提供的招聘需求（职位名称、职位JD等）自动登录并检索多个招聘网站中的符合条件的候选人简历，并使用AI对这些简历进行评分，最终在客户端上呈现给用户，以供用户快速评估与筛选。

## 系统架构

系统由客户端和服务端构成：

### 客户端（Mac/Windows 桌面端）
- 基于Electron+React构建
- 提供用户登录、创建任务、管理任务以及检索结果（简历列表）展示等功能
- 与服务端进行交互，进行用户鉴权，以及获取大模型API-Key
- 使用Playwright实现自动登录并爬取不同招聘平台的信息

### 服务端（Linux上运行，Python实现）
- 基于FastAPI构建
- 负责管理用户登录信息、收费/订阅等信息
- 根据用户身份信息返回相应的大模型API-Key或调用凭证

## 项目结构

```
TalentScout/
├── client/                  # 客户端代码
│   ├── public/              # 静态资源
│   ├── src/                 # 源代码
│   │   ├── components/      # React组件
│   │   ├── pages/           # 页面组件
│   │   ├── services/        # 服务调用
│   │   ├── utils/           # 工具函数
│   │   └── crawler/         # 爬虫模块
│   ├── package.json         # 依赖配置
│   └── electron/            # Electron主进程代码
└── server/                  # 服务端代码
    ├── app/                 # 应用代码
    │   ├── api/             # API路由
    │   ├── models/          # 数据模型
    │   ├── services/        # 业务逻辑
    │   └── utils/           # 工具函数
    ├── requirements.txt     # Python依赖
    └── main.py              # 入口文件
```

## 开发计划

1. 搭建基础框架
   - 客户端：Electron+React环境配置
   - 服务端：FastAPI环境配置

2. 实现核心功能
   - 用户登录与鉴权
   - 任务创建与管理
   - 招聘平台爬虫
   - 简历评分与展示

3. 优化与完善
   - UI/UX优化
   - 性能优化
   - 安全性增强

## 快速开始
### Server端运行
```shell
cd server
python3 main.py
```

### Client端运行
```shell
cd client
npm run start
```