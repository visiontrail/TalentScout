/**
 * 智联招聘爬虫实现
 */

import { BaseCrawler, CrawlerConfig, CandidateInfo } from '../index';

export class ZhilianCrawler extends BaseCrawler {
  platformName = '智联招聘';
  
  /**
   * 登录智联招聘
   * @param username 用户名
   * @param password 密码
   * @returns 登录是否成功
   */
  async login(username: string, password: string): Promise<boolean> {
    try {
      // 这里实际上会通过Electron的IPC调用主进程中的Playwright来实现登录
      console.log(`正在登录智联招聘，用户名: ${username}`);
      
      // 调用Electron主进程的登录方法
      const result = await window.electronAPI.loginPlatform({
        platform: 'zhilian',
        username,
        password
      });
      
      return result.success;
    } catch (error) {
      this.handleError(error, '登录');
      return false;
    }
  }
  
  /**
   * 搜索候选人
   * @param config 搜索配置
   * @returns 候选人列表
   */
  async searchCandidates(config: CrawlerConfig): Promise<CandidateInfo[]> {
    try {
      console.log(`正在智联招聘搜索候选人，职位: ${config.jobTitle}`);
      
      // 调用Electron主进程的搜索方法
      const result = await window.electronAPI.searchCandidates({
        platform: 'zhilian',
        jobTitle: config.jobTitle,
        location: config.location,
        experience: config.experience,
        education: config.education,
        keywords: config.keywords,
        maxCandidates: config.maxCandidates || 20
      });
      
      if (!result.success) {
        throw new Error(result.error || '搜索候选人失败');
      }
      
      return result.candidates.map((candidate: any) => ({
        name: candidate.name,
        gender: candidate.gender,
        age: candidate.age,
        education: candidate.education,
        experience: candidate.experience,
        contact: candidate.contact,
        resumeText: candidate.resumeText,
        sourcePlatform: this.platformName
      }));
    } catch (error) {
      this.handleError(error, '搜索候选人');
      return [];
    }
  }
  
  /**
   * 获取候选人详细信息
   * @param candidateId 候选人ID
   * @returns 候选人详细信息
   */
  async getCandidateDetail(candidateId: string): Promise<CandidateInfo> {
    try {
      console.log(`正在获取智联招聘候选人详情，ID: ${candidateId}`);
      
      // 调用Electron主进程的获取详情方法
      const result = await window.electronAPI.getCandidateDetail({
        platform: 'zhilian',
        candidateId
      });
      
      if (!result.success) {
        throw new Error(result.error || '获取候选人详情失败');
      }
      
      return {
        name: result.candidate.name,
        gender: result.candidate.gender,
        age: result.candidate.age,
        education: result.candidate.education,
        experience: result.candidate.experience,
        contact: result.candidate.contact,
        resumeText: result.candidate.resumeText,
        sourcePlatform: this.platformName
      };
    } catch (error) {
      this.handleError(error, '获取候选人详情');
      return {
        name: '未知',
        resumeText: '',
        sourcePlatform: this.platformName
      };
    }
  }
}