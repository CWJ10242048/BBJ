import type { UserInfo } from '@/types/user';

// 模拟用户数据
export const mockUserInfo: UserInfo = {
  id: 1,
  username: 'teacher',
  nickname: '李老师',
  avatarUrl: '/src/assets/image/lock-back.jpg',
  phone: '13800000000',
  email: 'Mrsli@example.com',
  school: '计算机科学大学',
  subject: 'computer_science',
  role: 'teacher'
};

// 模拟API响应
export const mockApiResponse = <T>(data: T, delay = 500): Promise<{data: T}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data });
    }, delay);
  });
}; 