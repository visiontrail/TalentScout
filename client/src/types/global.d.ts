interface LogMessage {
  level: string;
  message: string;
}

declare interface Window {
  electronAPI: {
    // 平台凭证管理
    savePlatformCredentials: (data: any) => Promise<any>;
    getPlatformCredentials: (data: any) => Promise<any>;
    
    // 爬虫操作
    startCrawler: (data: any) => Promise<any>;
    startMcpCrawler: (data: any) => Promise<any>;
    loginPlatform: (data: any) => Promise<any>;
    searchCandidates: (data: any) => Promise<any>;
    getCandidateDetail: (data: any) => Promise<any>;
    stopCrawler: () => Promise<any>;
    
    // 导出功能
    exportExcel: (data: any) => Promise<any>;
    exportPdf: (data: any) => Promise<any>;
    
    // 日志功能
    logMessage: (data: LogMessage) => void;
  };
} 