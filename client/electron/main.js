const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');

// 初始化配置存储
const store = new Store({
  encryptionKey: 'talentscout-secure-key', // 用于加密本地存储的密钥
});

// 创建日志目录
const logDir = path.join(os.homedir(), '.talentscout', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日志文件路径
const now = new Date();
const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const logFile = path.join(logDir, `talentscout-main-${dateStr}.log`);

// main.js 中的日志函数
function log(level, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  // 输出到控制台并标记来源
  console.log(`[主进程] ${logMessage}`);
  
  // 写入日志文件前确保目录存在
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(logFile, logMessage + '\n');
    console.log(`日志已写入: ${logFile}`);
  } catch (error) {
    console.error('写入日志文件失败:', error);
  }
}

// 初始化日志
log('INFO', '===== TalentScout 主进程日志开始 =====');

// 接收渲染进程日志
ipcMain.on('log-message', (event, { level, message }) => {
  log(level, `[Renderer] ${message}`);
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
      nodeIntegration: false,
      contextIsolation: true,
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

// IPC通信：启动MCP爬虫
ipcMain.handle('start-mcp-crawler', async (event, { taskName, jobDescription, apiKey }) => {
  try {
    log('INFO', `开始为任务 "${taskName}" 启动MCP爬虫`);
    
    // 设置DeepSeek API配置
    const deepSeekConfig = {
      apiKey: apiKey || 'sk-pbxwzbwsubwzmtsfusculgwzypxivjxdtvwuioxfemsejyrf', // 使用传入的API密钥或默认值
      baseUrl: 'https://api.deepseek.com'
    };
    log('INFO', `DeepSeek API配置完成，使用API: ${deepSeekConfig.apiKey.substring(0, 5)}...`);

    // 设置MCP爬虫的Playwright配置
    const mcpPlaywrightConfig = {
      autoApprove: [
        "start_codegen_session",
        "end_codegen_session",
        "get_codegen_session",
        "clear_codegen_session",
        "playwright_navigate",
        "playwright_screenshot",
        "playwright_click",
        "playwright_iframe_click",
        "playwright_fill",
        "playwright_select",
        "playwright_hover",
        "playwright_evaluate",
        "playwright_console_logs",
        "playwright_close",
        "playwright_get",
        "playwright_post",
        "playwright_put",
        "playwright_patch",
        "playwright_delete",
        "playwright_expect_response",
        "playwright_assert_response",
        "playwright_custom_user_agent",
        "playwright_get_visible_text",
        "playwright_get_visible_html",
        "playwright_go_back",
        "playwright_go_forward",
        "playwright_drag",
        "playwright_press_key",
        "playwright_save_as_pdf",
        "browserbase_create_session"
      ],
      disabled: false,
      timeout: 60,
      command: 'npx',
      args: ['-y', '@executeautomation/playwright-mcp-server'],
      env: {
        // 设置为非无头模式，让用户可以看到浏览器
        PLAYWRIGHT_HEADLESS: 'false',
        // 为确保正确在macOS上运行，设置PATH
        PATH: process.env.PATH
      },
      transportType: 'stdio'
    };
    log('INFO', `MCP Playwright配置完成`);

    // 检查是否有npx命令
    try {
      log('INFO', `检查是否安装了npx...`);
      const { execSync } = require('child_process');
      execSync('which npx', { stdio: 'ignore' });
      log('INFO', `npx命令可用`);
    } catch (error) {
      log('ERROR', `未找到npx命令，请确保已安装Node.js: ${error.message}`);
      return { success: false, error: `未找到npx命令，请确保已安装Node.js` };
    }

    // 启动MCP Server
    log('INFO', '启动MCP Playwright服务...');
    log('INFO', `执行命令: ${mcpPlaywrightConfig.command} ${mcpPlaywrightConfig.args.join(' ')}`);
    
    const mcpProcess = spawn(
      mcpPlaywrightConfig.command,
      mcpPlaywrightConfig.args,
      {
        env: { ...process.env, ...mcpPlaywrightConfig.env },
        shell: true
      }
    );

    // 捕获和记录MCP服务的输出
    let mcpOutput = '';
    mcpProcess.stdout.on('data', (data) => {
      const output = data.toString();
      mcpOutput += output;
      log('INFO', `MCP输出: ${output.trim()}`);
    });

    mcpProcess.stderr.on('data', (data) => {
      const output = data.toString();
      mcpOutput += output;
      log('ERROR', `MCP错误: ${output.trim()}`);
    });

    let mcpServerReady = false;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('启动MCP Server超时')), 30000);
    });

    // 等待MCP Server启动完成
    const serverReadyPromise = new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (mcpOutput.includes('Server started') || mcpOutput.includes('ready')) {
          clearInterval(checkInterval);
          mcpServerReady = true;
          resolve();
        }
      }, 500);
      
      mcpProcess.on('exit', (code) => {
        clearInterval(checkInterval);
        if (!mcpServerReady) {
          log('ERROR', `MCP进程异常退出，退出码: ${code}，输出: ${mcpOutput}`);
          resolve(); // 让Promise完成以便我们可以处理错误
        }
      });
    });

    try {
      // 等待服务器准备好或超时
      log('INFO', '等待MCP服务启动...');
      await Promise.race([serverReadyPromise, timeoutPromise]);
    } catch (error) {
      log('ERROR', `等待MCP服务启动失败: ${error.message}`);
      if (mcpProcess) {
        mcpProcess.kill();
        log('INFO', 'MCP进程已终止');
      }
      return { success: false, error: error.message };
    }

    if (!mcpServerReady) {
      log('ERROR', 'MCP Server未能成功启动，检查日志以获取详细信息');
      if (mcpProcess) {
        mcpProcess.kill();
        log('INFO', 'MCP进程已终止');
      }
      return { success: false, error: `MCP Server未能成功启动，详细信息: ${mcpOutput}` };
    }

    log('INFO', 'MCP服务启动成功，准备调用DeepSeek API');

    // 构建与大模型的通信提示词
    const systemPrompt = `你是一个专业的招聘爬虫助手，你需要帮助用户从招聘网站获取候选人信息。
根据用户提供的职位描述，你需要：
1. 使用playwright工具打开浏览器并访问招聘网站
2. 协助用户完成登录（用户会在浏览器中手动输入账号密码）
3. 搜索合适的候选人
4. 收集候选人信息

请逐步执行，确保在每个步骤都清楚地告诉用户当前正在做什么以及需要用户做什么。`;

    const userPrompt = `我需要招聘"${taskName}"岗位的人才。职位描述如下：
${jobDescription}

请帮我执行以下步骤：
1. 打开浏览器访问Boss直聘网站
2. 等待我在浏览器中完成登录
3. 搜索符合上述职位描述的候选人
4. 收集候选人的姓名、工作经验、教育背景等信息`;

    // 使用OpenAI兼容的接口调用DeepSeek模型
    log('INFO', '正在调用DeepSeek API...');
    
    try {
      // 动态导入node-fetch (ESM模块)
      const { default: fetch } = await import('node-fetch');
      
      log('INFO', '发送请求到DeepSeek API...');
      const response = await fetch(deepSeekConfig.baseUrl + '/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepSeekConfig.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          tools: mcpPlaywrightConfig.autoApprove.map(toolName => ({
            type: 'function',
            function: { name: toolName }
          }))
        })
      });

      const responseData = await response.json();
      log('INFO', `DeepSeek API响应状态: ${response.status}`);
      
      // 将响应保存到文件以供调试
      const responseDir = path.join(logDir, 'responses');
      if (!fs.existsSync(responseDir)) {
        fs.mkdirSync(responseDir, { recursive: true });
      }
      const responseFile = path.join(responseDir, `deepseek-response-${Date.now()}.json`);
      fs.writeFileSync(responseFile, JSON.stringify(responseData, null, 2));
      log('INFO', `DeepSeek响应已保存到: ${responseFile}`);

      // 处理响应结果
      if (responseData.error) {
        log('ERROR', `DeepSeek API错误: ${JSON.stringify(responseData.error)}`);
        if (mcpProcess) {
          mcpProcess.kill();
          log('INFO', 'MCP进程已终止');
        }
        return { success: false, error: `DeepSeek API错误: ${responseData.error.message}` };
      }

      // 提取工具调用结果
      const assistantMessage = responseData.choices?.[0]?.message;
      log('INFO', `获取到AI助手消息: ${JSON.stringify(assistantMessage).substring(0, 200)}...`);

      // 收集爬取到的候选人信息
      const candidates = [];
      // 在实际应用中，这里应该解析工具调用结果并提取候选人信息
      
      // 结束MCP进程
      if (mcpProcess) {
        mcpProcess.kill();
        log('INFO', 'MCP进程已终止');
      }

      return { 
        success: true, 
        message: '爬虫任务已完成', 
        candidates,
        aiResponse: assistantMessage?.content
      };
    } catch (error) {
      log('ERROR', `调用DeepSeek API失败: ${error.message}`);
      if (mcpProcess) {
        mcpProcess.kill();
        log('INFO', 'MCP进程已终止');
      }
      return { success: false, error: `调用DeepSeek API失败: ${error.message}` };
    }
  } catch (error) {
    log('ERROR', `MCP爬虫执行失败: ${error.message}`);
    console.error('MCP爬虫执行失败:', error);
    return { success: false, error: error.message };
  }
});

// IPC通信：平台登录
ipcMain.handle('login-platform', async (event, { platform }) => {
  try {
    log('INFO', `开始为平台 ${platform} 启动登录流程`);
    
    // 启动浏览器
    log('INFO', '正在启动浏览器...');
    const browser = await chromium.launch({
      headless: false, // 非无头模式，让用户看到浏览器
      args: ['--start-maximized'], // 最大化窗口
      ignoreDefaultArgs: ['--mute-audio'], // 允许音频播放
    });
    
    log('INFO', '浏览器启动成功，创建新页面');
    // 创建新页面
    const page = await browser.newPage();
    
    // 根据平台跳转到不同的登录页
    let loginUrl = '';
    switch (platform) {
      case 'boss':
        loginUrl = 'https://www.zhipin.com/login';
        break;
      case 'zhilian':
        loginUrl = 'https://passport.zhaopin.com/login';
        break;
      case 'lagou':
        loginUrl = 'https://passport.lagou.com/login/login.html';
        break;
      default:
        log('ERROR', `不支持的平台: ${platform}`);
        await browser.close();
        return { success: false, error: '不支持的平台' };
    }
    
    // 导航到登录页
    log('INFO', `正在导航到登录页: ${loginUrl}`);
    await page.goto(loginUrl, { timeout: 60000, waitUntil: 'domcontentloaded' });
    
    // 等待用户手动登录
    log('INFO', `请在打开的浏览器中登录${platform}...`);
    
    // 等待导航到成功登录后的页面
    // 这个部分需要根据不同平台的登录成功标识来判断
    // 例如，检测URL变化或特定元素出现
    const successIndicators = {
      boss: [
        // URL变化到主页
        async () => page.url().includes('/web/geek'),
        // 或检测特定元素
        async () => (await page.$('.user-nav')) !== null
      ],
      zhilian: [
        async () => page.url().includes('/cv'),
        async () => (await page.$('.nav-user-wrapper')) !== null
      ],
      lagou: [
        async () => page.url().includes('/gongzuo'),
        async () => (await page.$('.user')) !== null
      ]
    };
    
    // 设置最长等待时间（5分钟）
    const maxWaitTime = 5 * 60 * 1000;
    const startTime = Date.now();
    
    log('INFO', `开始等待登录完成，最长等待时间: ${maxWaitTime/1000}秒`);
    let isLoggedIn = false;
    while (Date.now() - startTime < maxWaitTime) {
      for (const checkFn of successIndicators[platform]) {
        try {
          if (await checkFn()) {
            isLoggedIn = true;
            break;
          }
        } catch (e) {
          // 忽略检查过程中的错误
        }
      }
      
      if (isLoggedIn) break;
      await new Promise(resolve => setTimeout(resolve, 1000)); // 每秒检查一次
    }
    
    if (!isLoggedIn) {
      log('ERROR', '登录超时，请重试');
      await browser.close();
      return { success: false, error: '登录超时，请重试' };
    }
    
    // 保存cookies用于后续使用
    log('INFO', '登录成功，正在保存cookies');
    const cookies = await page.context().cookies();
    const platformKey = `platform.${platform}.cookies`;
    store.set(platformKey, cookies);
    
    // 截图保存登录状态
    const screenshotDir = path.join(os.homedir(), '.talentscout', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    const screenshotPath = path.join(screenshotDir, `${platform}-login-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    log('INFO', `已保存登录状态截图: ${screenshotPath}`);
    
    // 关闭浏览器
    log('INFO', '关闭浏览器');
    await browser.close();
    
    return { success: true, message: '登录成功' };
  } catch (error) {
    log('ERROR', `平台登录失败: ${error.message}`);
    console.error('平台登录失败:', error);
    return { success: false, error: error.message };
  }
});