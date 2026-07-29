import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('crm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  me: () => apiClient.get('/auth/me'),
  registerAgency: (data: {
    agencyName: string;
    city: string;
    agentCount: number;
    website?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => apiClient.post('/auth/register-agency', data),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => apiClient.post('/auth/reset-password', { token, newPassword }),
};

// Dashboard
export const dashboardApi = {
  kpis: () => apiClient.get('/dashboard/kpis'),
  leadsByStatus: () => apiClient.get('/dashboard/leads-by-status'),
  leadsBySource: () => apiClient.get('/dashboard/leads-by-source'),
  dealsByStage: () => apiClient.get('/dashboard/deals-by-stage'),
  recentLeads: () => apiClient.get('/dashboard/recent-leads'),
  agentPerformance: () => apiClient.get('/dashboard/agent-performance'),
  leadTrend: () => apiClient.get('/dashboard/lead-trend'),
};

// Leads
export const leadsApi = {
  list: (params?: Record<string, any>) => apiClient.get('/leads', { params }),
  get: (id: string) => apiClient.get(`/leads/${id}`),
  create: (data: any) => apiClient.post('/leads', data),
  update: (id: string, data: any) => apiClient.patch(`/leads/${id}`, data),
  delete: (id: string) => apiClient.delete(`/leads/${id}`),
  addNote: (id: string, note: string) => apiClient.post(`/leads/${id}/notes`, { note }),
};

// Contacts
export const contactsApi = {
  list: (params?: Record<string, any>) => apiClient.get('/contacts', { params }),
  get: (id: string) => apiClient.get(`/contacts/${id}`),
  create: (data: any) => apiClient.post('/contacts', data),
  update: (id: string, data: any) => apiClient.patch(`/contacts/${id}`, data),
  delete: (id: string) => apiClient.delete(`/contacts/${id}`),
};

// Properties
export const propertiesApi = {
  list: (params?: Record<string, any>) => apiClient.get('/properties', { params }),
  get: (id: string) => apiClient.get(`/properties/${id}`),
  create: (data: any) => apiClient.post('/properties', data),
  update: (id: string, data: any) => apiClient.patch(`/properties/${id}`, data),
  delete: (id: string) => apiClient.delete(`/properties/${id}`),
};

// Deals
export const dealsApi = {
  list: (params?: Record<string, any>) => apiClient.get('/deals', { params }),
  pipeline: () => apiClient.get('/deals/pipeline'),
  get: (id: string) => apiClient.get(`/deals/${id}`),
  create: (data: any) => apiClient.post('/deals', data),
  update: (id: string, data: any) => apiClient.patch(`/deals/${id}`, data),
  delete: (id: string) => apiClient.delete(`/deals/${id}`),
};

// Tasks
export const tasksApi = {
  list: (params?: Record<string, any>) => apiClient.get('/tasks', { params }),
  upcoming: () => apiClient.get('/tasks/upcoming'),
  get: (id: string) => apiClient.get(`/tasks/${id}`),
  create: (data: any) => apiClient.post('/tasks', data),
  update: (id: string, data: any) => apiClient.patch(`/tasks/${id}`, data),
  delete: (id: string) => apiClient.delete(`/tasks/${id}`),
};

// Users
export const usersApi = {
  list: () => apiClient.get('/users'),
  get: (id: string) => apiClient.get(`/users/${id}`),
  create: (data: any) => apiClient.post('/users', data),
  update: (id: string, data: any) => apiClient.patch(`/users/${id}`, data),
};

// Activities
export const activitiesApi = {
  list: (params?: Record<string, any>) => apiClient.get('/activities', { params }),
};

// Integrations
export const integrationsApi = {
  getHousingCom: () => apiClient.get('/integrations/housing'),
  saveHousingCom: (data: { housingId: string; secretKey?: string }) =>
    apiClient.post('/integrations/housing', data),
  fetchHousingLeads: () => apiClient.post('/integrations/housing/fetch-leads'),
  getApifyHousing: () => apiClient.get('/integrations/apify/housing'),
  saveApifyHousing: (data: { actorId: string; token?: string; actorInput?: Record<string, unknown> }) =>
    apiClient.post('/integrations/apify/housing', data),
  testApifyHousingImport: () => apiClient.post('/integrations/apify/housing/test-import'),
};
