const { contextBridge, ipcRenderer } = require('electron');

// 在window对象上暴露API给渲染进程使用
contextBridge.exposeInMainWorld('electronAPI', {
  // 平台凭证管理
  savePlatformCredentials: (data) => ipcRenderer.invoke('save-platform-credentials', data),
  getPlatformCredentials: (data) => ipcRenderer.invoke('get-platform-credentials', data),
  
  // 爬虫操作
  startCrawler: (data) => ipcRenderer.invoke('start-crawler', data),
  startMcpCrawler: (data) => ipcRenderer.invoke('start-mcp-crawler', data),
  loginPlatform: (data) => ipcRenderer.invoke('login-platform', data),
  searchCandidates: (data) => ipcRenderer.invoke('search-candidates', data),
  getCandidateDetail: (data) => ipcRenderer.invoke('get-candidate-detail', data),
  stopCrawler: () => ipcRenderer.invoke('stop-crawler'),
  
  // 导出功能
  exportExcel: (data) => ipcRenderer.invoke('export-excel', data),
  exportPdf: (data) => ipcRenderer.invoke('export-pdf', data),
  
  // 日志功能
  logMessage: (data) => ipcRenderer.send('log-message', data),
});