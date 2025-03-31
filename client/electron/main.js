const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { chromium } = require('playwright');

// 初始化配置存储
const store = new Store({
  encryptionKey: 'talentscout-secure-key', // 用于加密本地存储的密钥
});

// 开发环境判断
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// 保持窗口对象的全局引用，避免JavaScript垃圾回收时窗口被关闭
let mainWindow;

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // 加载应用
  if (isDev) {
    // 开发环境下加载开发服务器URL
    mainWindow.loadURL('http://localhost:3000');
    // 打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境下加载打包后的index.html
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 窗口关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 应用准备就绪时创建窗口
app.whenReady().then(() => {
  createWindow();

  // macOS中点击dock图标时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 所有窗口关闭时退出应用（Windows & Linux）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC通信：保存平台登录信息
ipcMain.handle('save-platform-credentials', async (event, { platform, username, password }) => {
  try {
    // 加密存储平台登录信息
    const platformKey = `platform.${platform}`;
    store.set(platformKey, { username, password });
    return { success: true };
  } catch (error) {
    console.error('保存平台登录信息失败:', error);
    return { success: false, error: error.message };
  }
});

// IPC通信：获取平台登录信息
ipcMain.handle('get-platform-credentials', async (event, { platform }) => {
  try {
    const platformKey = `platform.${platform}`;
    const credentials = store.get(platformKey);
    return { success: true, credentials };
  } catch (error) {
    console.error('获取平台登录信息失败:', error);
    return { success: false, error: error.message };
  }
});

// IPC通信：启动爬虫
ipcMain.handle('start-crawler', async (event, { platform, jobDescription }) => {
  try {
    // 获取平台登录信息
    const platformKey = `platform.${platform}`;
    const credentials = store.get(platformKey);
    
    if (!credentials) {
      return { success: false, error: '未找到平台登录信息' };
    }
    
    // 启动浏览器
    const browser = await chromium.launch({
      headless: false, // 设置为false以便用户可以看到浏览器操作和处理验证码
    });
    
    // 创建新页面
    const page = await browser.newPage();
    
    // 根据不同平台执行不同的爬虫逻辑
    let results = [];
    
    switch (platform) {
      case 'boss':
        // BOSS直聘爬虫逻辑
        await page.goto('https://www.zhipin.com/login');
        // 登录逻辑...
        // 搜索逻辑...
        break;
      case 'zhilian':
        // 智联招聘爬虫逻辑
        await page.goto('https://www.zhaopin.com/');
        // 登录逻辑...
        // 搜索逻辑...
        break;
      // 其他平台...
      default:
        await browser.close();
        return { success: false, error: '不支持的平台' };
    }
    
    // 关闭浏览器
    await browser.close();
    
    return { success: true, results };
  } catch (error) {
    console.error('爬虫执行失败:', error);
    return { success: false, error: error.message };
  }
});

// IPC通信：导出Excel
ipcMain.handle('export-excel', async (event, { data }) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: '导出Excel',
      defaultPath: path.join(app.getPath('documents'), 'candidates.xlsx'),
      filters: [{ name: 'Excel文件', extensions: ['xlsx'] }],
    });
    
    if (!filePath) return { success: false, error: '未选择保存路径' };
    
    // 这里应该有导出Excel的逻辑
    // 由于需要额外的库支持，这里只是示例
    
    return { success: true, filePath };
  } catch (error) {
    console.error('导出Excel失败:', error);
    return { success: false, error: error.message };
  }
});