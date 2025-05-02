import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { UserInfo, UserUpdateRequest, PasswordUpdateRequest, AvatarUploadResponse } from '@/types/user';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,  // 使用环境变量中的API地址
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从localStorage获取token添加到请求头
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // 处理401错误
    if (error.response && error.response.status === 401) {
      // 清除token
      localStorage.removeItem('token');
      // 重定向到登录页
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 用户API服务
export const userApi = {
  // 获取用户信息
  getUserInfo(): Promise<AxiosResponse<UserInfo>> {
    return api.get('/user/info');
  },
  
  // 更新用户信息
  updateUser(data: UserUpdateRequest): Promise<AxiosResponse<UserInfo>> {
    return api.put('/user/update', data);
  },
  
  // 修改密码
  changePassword(data: PasswordUpdateRequest): Promise<AxiosResponse<{success: boolean; message: string}>> {
    return api.put('/user/change-password', data);
  },
  
  // 上传头像
  uploadAvatar(file: File): Promise<AxiosResponse<AvatarUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/user/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default api; 