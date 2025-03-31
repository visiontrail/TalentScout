/**
 * 爬虫模块入口文件
 * 提供统一的爬虫接口，用于爬取不同招聘平台的信息
 */

import { BossZhipinCrawler } from './platforms/BossZhipin';
import { ZhilianCrawler } from './platforms/Zhilian';
import { LagouCrawler } from './platforms/Lagou';

// 平台类型
export type PlatformType = 'boss' | 'zhilian' | 'lagou';

// 爬虫配置接口
export interface CrawlerConfig {
  jobTitle: string;
  jobDescription: string;
  location?: string;
  experience?: string;
  education?: string;
  keywords?: string[];
  maxCandidates?: number;
}

// 候选人信息接口
export interface CandidateInfo {
  name: string;
  gender?: string;
  age?: number;
  education?: string;
  experience?: string;
  contact?: string;
  resumeText: string;
  sourcePlatform: string;
}

// 爬虫工厂函数，根据平台类型创建对应的爬虫实例
export function createCrawler(platform: PlatformType) {
  switch (platform) {
    case 'boss':
      return new BossZhipinCrawler();
    case 'zhilian':
      return new ZhilianCrawler();
    case 'lagou':
      return new LagouCrawler();
    default:
      throw new Error(`不支持的平台类型: ${platform}`);
  }
}

// 爬虫基类，定义通用接口和方法
export abstract class BaseCrawler {
  abstract platformName: string;
  
  // 登录方法
  abstract login(username: string, password: string): Promise<boolean>;
  
  // 搜索候选人方法
  abstract searchCandidates(config: CrawlerConfig): Promise<CandidateInfo[]>;
  
  // 获取候选人详细信息方法
  abstract getCandidateDetail(candidateId: string): Promise<CandidateInfo>;
  
  // 通用的错误处理方法
  protected handleError(error: any, operation: string): void {
    console.error(`${this.platformName} 爬虫在${operation}时发生错误:`, error);
    throw new Error(`${this.platformName} 爬虫错误: ${error.message || '未知错误'}`);
  }
}