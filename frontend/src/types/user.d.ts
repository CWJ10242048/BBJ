// 用户信息接口
export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  avatarUrl: string;
  phone: string;
  email: string;
  school: string;
  subject: string;
  role: string;
}

// 用户更新请求接口
export interface UserUpdateRequest {
  nickname?: string;
  avatarUrl?: string;
  phone?: string;
  email?: string;
  school?: string;
  subject?: string;
}

// 密码更新请求接口
export interface PasswordUpdateRequest {
  oldPassword: string;
  newPassword: string;
}

// 头像上传响应接口
export interface AvatarUploadResponse {
  success: boolean;
  avatarUrl: string;
} 