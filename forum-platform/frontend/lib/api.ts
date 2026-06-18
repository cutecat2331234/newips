import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  sortOrder: number;
  parentId?: string;
  topics: { id: string }[];
  children?: { id: string; name: string; slug: string }[];
}

export interface Topic {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  author: User;
  createdAt: string;
  viewCount: number;
  replyCount: number;
  isPinned: boolean;
  tags?: { tag: { id: string; name: string; color: string } }[];
}

export interface Post {
  id: string;
  content: string;
  topicId: string;
  author: User;
  createdAt: string;
  parentId?: string;
  parent?: { id: string; content: string; author: { username: string } };
  likes: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }),
  
  register: (email: string, username: string, password: string, displayName?: string) =>
    api.post<LoginResponse>('/auth/register', { email, username, password, displayName }),
};

export const userApi = {
  getUsers: () => api.get<User[]>('/users'),
  
  getUser: (id: string) => api.get<User>(`/users/${id}`),
  
  updateUser: (id: string, data: Partial<User>) =>
    api.patch<User>(`/users/${id}`, data),
};

export const forumApi = {
  getCategories: () => api.get<Category[]>('/forums/categories'),
  
  getCategoryBySlug: (slug: string) =>
    api.get<{
      id: string;
      name: string;
      description?: string;
      slug: string;
      topics: Topic[];
      parent?: { id: string; name: string; slug: string };
      children?: { id: string; name: string; slug: string }[];
    }>(`/forums/categories/${slug}`),
  
  createTopic: (title: string, content: string, categoryId: string, tags?: string[]) =>
    api.post<Topic>('/forums/topics', { title, content, categoryId, tags }),
  
  getTopicById: (id: string) =>
    api.get<{
      id: string;
      title: string;
      content: string;
      categoryId: string;
      author: User;
      createdAt: string;
      viewCount: number;
      replyCount: number;
      category: { id: string; name: string; slug: string };
      tags: { tag: { id: string; name: string; color: string } }[];
      posts: Post[];
    }>(`/forums/topics/${id}`),
  
  createPost: (content: string, topicId: string, parentId?: string) =>
    api.post<Post>('/forums/posts', { content, topicId, parentId }),
  
  getTags: () => api.get<Tag[]>('/forums/tags'),
};

export default api;