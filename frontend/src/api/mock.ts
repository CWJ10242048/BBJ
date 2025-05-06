import type { UserInfo } from '@/types/user';
import lockBackImg from '@/assets/image/lock-back.jpg';

// 管理员 mock 数据
const adminUserInfo: UserInfo = {
  id: 0,
  username: 'admin',
  nickname: '超级管理员',
  avatarUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // 管理员风格头像
  phone: '13812345000',
  email: 'admin@example.com',
  school: '备倍佳AI备课公司', // 所在公司
  subject: '平台管理', // 管理领域
  role: 'admin'
};

// 教师 mock 数据
const teacherUserInfo: UserInfo = {
  id: 1,
  username: 'teacher',
  nickname: '李老师',
  avatarUrl: lockBackImg,
  phone: '13800000000',
  email: 'Mrsli@example.com',
  school: '计算机科学大学',
  subject: 'computer_science',
  role: 'teacher'
};

// 根据角色返回不同 mock 数据
export const mockUserInfo = (role: 'admin' | 'teacher' = 'teacher'): UserInfo => {
  return role === 'admin' ? adminUserInfo : teacherUserInfo;
};

// 模拟API响应
export const mockApiResponse = <T>(data: T, delay = 500): Promise<{data: T}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data });
    }, delay);
  });
}; 