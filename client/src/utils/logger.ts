// 日志消息接口
interface LogMessage {
  level: string;
  message: string;
}

class Logger {
  /**
   * 添加日志
   * @param level 日志级别
   * @param message 日志消息
   */
  private log(level: string, message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    // 使用更明显的格式输出到控制台
    console.log(`%c ${logMessage}`, 'color: blue; font-weight: bold');
    
    // 确保Electron API可用时才发送
    if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.logMessage) {
      try {
        window.electronAPI.logMessage({ level, message });
        console.log('日志已发送到主进程');
      } catch (error) {
        console.error('发送日志到主进程失败:', error);
      }
    } else {
      console.log('Electron API不可用，仅显示在控制台');
    }
  }
  
  info(message: string) {
    this.log('INFO', message);
  }
  
  warn(message: string) {
    this.log('WARN', message);
  }
  
  error(message: string) {
    this.log('ERROR', message);
  }
  
  debug(message: string) {
    this.log('DEBUG', message);
  }
}

const logger = new Logger();
export default logger; 