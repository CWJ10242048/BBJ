import axios from 'axios';
import type { AxiosResponse } from 'axios';

// 定义类型
export interface HistoryRecord {
  id: number;
  content: string;
  type: string;
  time: string;
}

// 获取环境相关的API基础URL
const getApiBaseUrl = (): string => {
  // 使用相对路径，通过Vite代理访问后端
  return '/api';
};

// 创建axios实例
const API_BASE_URL = getApiBaseUrl();

// 创建axios实例，添加通用配置
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10秒超时
});

// 请求拦截器，可以在这里添加认证token等
apiClient.interceptors.request.use(
  config => {
    // 可以在这里添加授权token等
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器，统一处理错误
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error('API请求失败:', error);
    return Promise.reject(error);
  }
);

// 历史记录API函数
export const historyApi = {
  // 获取历史记录列表
  getRecords(): Promise<AxiosResponse<HistoryRecord[]>> {
    return apiClient.get('/history/records');
  },
  
  // 删除历史记录
  deleteRecord(id: number): Promise<AxiosResponse<any>> {
    return apiClient.delete(`/history/records/${id}`);
  },
  
  // 导出历史记录（如果后端支持的话）
  exportRecord(id: number): Promise<AxiosResponse<any>> {
    return apiClient.get(`/history/records/${id}/export`, {
      responseType: 'blob' // 用于文件下载
    });
  }
};

// 模拟数据，用于API失败时的后备显示
export const getMockHistoryData = (): HistoryRecord[] => {
  return [
    {
      id: 1,
      content: '《计算机组成原理教案》已生成，包含教学目标、重难点分析、教学过程等。',
      type: '教案',
      time: '2025-05-10T15:32:10'
    },
    {
      id: 2,
      content: '《Python编程基础PPT》自动生成，含代码示例和练习题。',
      type: 'PPT',
      time: '2025-05-10T14:58:22'
    },
    {
      id: 3,
      content: '《数据结构与算法习题集》已生成，包含常见题型及解析。',
      type: '习题',
      time: '2025-05-10T14:30:01'
    },
    {
      id: 4,
      content: '《计算机网络原理教案》已生成，包含详细步骤和代码。',
      type: '教案',
      time: '2025-05-10T13:50:45'
    },
    {
      id: 5,
      content: '《人工智能基础教学大纲》已生成，含课程目标、章节安排等。',
      type: '教学大纲',
      time: '2025-05-10T13:20:10'
    },
    {
      id: 6,
      content: '《操作系统课程PPT》自动生成，含核心概念与应用案例。',
      type: 'PPT',
      time: '2025-05-10T12:55:33'
    },
    {
      id: 7,
      content: '《网络安全基础习题》已生成，含详细解答。',
      type: '习题',
      time: '2025-05-10T12:30:12'
    },
    {
      id: 8,
      content: '《Java程序设计教案》生成，包含项目流程与代码。',
      type: '教案',
      time: '2025-05-10T12:10:01'
    },
    {
      id: 9,
      content: '《数据库原理PPT》生成，含基本概念与设计模式。',
      type: 'PPT',
      time: '2025-05-10T11:45:22'
    },
    {
      id: 10,
      content: '《软件工程教程》已生成，汇总常用方法与技巧。',
      type: '图文',
      time: '2025-05-10T11:20:10'
    },
    {
      id: 11,
      content: '《云计算课程习题集》自动生成，含典型问题及解答。',
      type: '习题',
      time: '2025-05-10T10:55:33'
    },
    {
      id: 12,
      content: '《前端开发框架PPT》生成，含常用框架与实践案例。',
      type: 'PPT',
      time: '2025-05-10T10:30:12'
    },
    {
      id: 13,
      content: '《计算机图形学教案》生成，讲解核心原理与算法。',
      type: '教案',
      time: '2025-05-10T10:10:01'
    },
    {
      id: 14,
      content: '《信息安全基础图文》生成，包含数据加密与攻击防护方法。',
      type: '图文',
      time: '2025-05-10T09:45:22'
    },
    {
      id: 15,
      content: '《计算机视觉习题集》已生成，含详细解析。',
      type: '习题',
      time: '2025-05-10T09:20:10'
    },
    {
      id: 16,
      content: '《嵌入式系统基础教案》已生成，包含硬件接口与编程技巧。',
      type: '教案',
      time: '2025-01-15T09:20:00'
    },
    {
      id: 17,
      content: '《C++数据结构PPT》自动生成，包含链表、树与图的应用。',
      type: 'PPT',
      time: '2025-01-15T09:35:00'
    },
    {
      id: 18,
      content: '《软件架构设计习题集》已生成，包含常见问题及案例。',
      type: '习题',
      time: '2025-01-15T09:40:00'
    },
    {
      id: 19,
      content: '《人工智能导论教案》已生成，介绍AI的核心算法与技术。',
      type: '教案',
      time: '2025-01-15T10:00:00'
    },
    {
      id: 20,
      content: '《数据挖掘课程PPT》自动生成，讲解分类与聚类算法。',
      type: 'PPT',
      time: '2025-01-15T10:10:00'
    },
    {
      id: 21,
      content: '《网络协议分析习题集》已生成，包含常见协议分析题目。',
      type: '习题',
      time: '2025-01-15T10:25:00'
    },
    {
      id: 22,
      content: '《云计算架构教案》生成，包含虚拟化、容器与云服务。',
      type: '教案',
      time: '2025-01-15T10:50:00'
    },
    {
      id: 23,
      content: '《数据库优化PPT》生成，讲解SQL查询优化与索引。',
      type: 'PPT',
      time: '2025-01-15T11:00:00'
    },
    {
      id: 24,
      content: '《计算机安全技术习题集》已生成，含常见安全漏洞解析。',
      type: '习题',
      time: '2025-01-15T11:10:00'
    },
    {
      id: 25,
      content: '《编译原理教案》已生成，讲解编译过程与优化技术。',
      type: '教案',
      time: '2025-01-15T11:20:00'
    },
    {
      id: 26,
      content: '《前端框架与技术PPT》生成，介绍Vue.js与React框架。',
      type: 'PPT',
      time: '2025-01-15T11:30:00'
    },
    {
      id: 27,
      content: '《操作系统习题集》已生成，包含内存管理与进程调度题目。',
      type: '习题',
      time: '2025-01-15T11:45:00'
    },
    {
      id: 28,
      content: '《大数据分析教程》教案生成，介绍MapReduce与Hadoop技术。',
      type: '教案',
      time: '2025-01-15T12:00:00'
    },
    {
      id: 29,
      content: '《区块链技术PPT》生成，讲解智能合约与加密技术。',
      type: 'PPT',
      time: '2025-01-15T12:10:00'
    },
    {
      id: 30,
      content: '《深度学习基础习题集》已生成，含常见算法与应用。',
      type: '习题',
      time: '2025-01-15T12:20:00'
    }
  ];
};

// 导出API基础URL，便于调试
export const apiBaseUrl = API_BASE_URL; 