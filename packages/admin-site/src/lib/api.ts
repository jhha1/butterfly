import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor - JWT 토큰 자동 첨부
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 인증 관련 API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  oauth: async (provider: string, code: string) => {
    const response = await api.post(`/auth/oauth/${provider}`, { code });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// 유저 관련 API
export const userAPI = {
  search: async (params: {
    platformId?: string;
    accountId?: string;
    playerId?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/users/search', { params });
    return response.data;
  },
  
  getProfile: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  getItems: async (userId: string) => {
    const response = await api.get(`/users/${userId}/items`);
    return response.data;
  },
  
  updateItem: async (userId: string, itemId: string, quantity: number) => {
    const response = await api.put(`/users/${userId}/items/${itemId}`, { quantity });
    return response.data;
  },
};

// 랭킹 관련 API
export const rankingAPI = {
  getList: async (params: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await api.get('/ranking', { params });
    return response.data;
  },
  
  getUserRank: async (userId: string) => {
    const response = await api.get(`/ranking/user/${userId}`);
    return response.data;
  },
  
  // 새로운 랭킹 API
  getRankings: async (params: {
    page?: number;
    limit?: number;
    category?: string;
  }) => {
    const response = await api.get('/rankings', { params });
    return response.data;
  },
};

// 로그 관련 API
export const logAPI = {
  getEvents: async (params: {
    eventType?: 'login' | 'item_purchase' | 'match_enter' | 'match_end';
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/logs/events', { params });
    return response.data;
  },
  
  getEventDetail: async (eventId: string) => {
    const response = await api.get(`/logs/events/${eventId}`);
    return response.data;
  },
  
  // 새로운 로그 API
  getLogs: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }) => {
    const response = await api.get('/logs', { params });
    return response.data;
  },
};

// 아이템 관련 API
export const itemAPI = {
  getItems: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  }) => {
    const response = await api.get('/items', { params });
    return response.data;
  },
  
  getItem: async (itemId: string) => {
    const response = await api.get(`/items/${itemId}`);
    return response.data;
  },
  
  createItem: async (itemData: Partial<Item>) => {
    const response = await api.post('/items', itemData);
    return response.data;
  },
  
  updateItem: async (itemId: string, itemData: Partial<Item>) => {
    const response = await api.put(`/items/${itemId}`, itemData);
    return response.data;
  },
  
  deleteItem: async (itemId: string) => {
    const response = await api.delete(`/items/${itemId}`);
    return response.data;
  },
};

// 타입 정의
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator';
  createdAt: string;
}

export interface GameUser {
  id: string;
  platformId: string;
  accountId: string;
  playerId: string;
  profile: {
    nickname: string;
    level: number;
    experience: number;
    rank: string;
  };
  createdAt: string;
  lastLoginAt: string;
}

export interface UserItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  category: string;
  rarity: string;
  iconUrl?: string;
}

export interface RankingEntry {
  rank: number;
  userId: string;
  nickname: string;
  score: number;
  tier: string;
  profileImageUrl?: string;
}

export interface EventLog {
  id: string;
  eventType: 'login' | 'item_purchase' | 'match_enter' | 'match_end';
  userId: string;
  userNickname: string;
  details: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

// 새로운 타입들
export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'misc';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
  };
}

export interface Ranking {
  id: string;
  playerId: string;
  playerName: string;
  score: number;
  rank: number;
  category: 'overall' | 'weekly' | 'monthly';
  achievedAt: string;
}

export interface Log {
  id: string;
  userId: string;
  userName: string;
  action: string;
  category: 'auth' | 'item' | 'game' | 'admin';
  details: string;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default api; 