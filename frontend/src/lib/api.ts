const API_BASE = '/api/v1';

export class ApiError extends Error {
  code: string;
  details?: any;
  requestId?: string;

  constructor(message: string, code: string = 'API_ERROR', details?: any, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    if (data && typeof data === 'object' && data.error) {
      throw new ApiError(data.error.message, data.error.code, data.error.details, data.error.requestId);
    }
    throw new ApiError(`Request failed with status ${response.status}: ${response.statusText}`);
  }

  return (data?.data ?? data) as T;
}

export const api = {
  // Auth
  signup: (body: any) => request<any>('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),
  refresh: () => request<any>('/auth/refresh', { method: 'POST' }),
  getMe: () => request<any>('/auth/me'),

  // Farms
  getFarms: () => request<any[]>('/farms'),
  getFarm: (farmId: string) => request<any>(`/farms/${farmId}`),
  createFarm: (body: any) => request<any>('/farms', { method: 'POST', body: JSON.stringify(body) }),
  updateFarm: (farmId: string, body: any) => request<any>(`/farms/${farmId}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteFarm: (farmId: string) => request<any>(`/farms/${farmId}`, { method: 'DELETE' }),

  // Fields
  getFields: (farmId: string) => request<any[]>(`/farms/${farmId}/fields`),
  getField: (fieldId: string) => request<any>(`/fields/${fieldId}`),
  createField: (farmId: string, body: any) => request<any>(`/farms/${farmId}/fields`, { method: 'POST', body: JSON.stringify(body) }),
  updateField: (fieldId: string, body: any) => request<any>(`/fields/${fieldId}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteField: (fieldId: string) => request<any>(`/fields/${fieldId}`, { method: 'DELETE' }),

  // Soil
  getFieldSoilReadings: (fieldId: string) => request<any[]>(`/fields/${fieldId}/soil-readings`),
  createSoilReading: (fieldId: string, body: any) => request<any>(`/fields/${fieldId}/soil-readings`, { method: 'POST', body: JSON.stringify(body) }),
  deleteSoilReading: (readingId: string) => request<any>(`/soil-readings/${readingId}`, { method: 'DELETE' }),

  // Disease
  submitDiseaseAssessment: (formData: FormData) => request<any>('/disease-assessments', { method: 'POST', body: formData }),
  getDiseaseAssessments: () => request<any[]>('/disease-assessments'),
  getDiseaseAssessment: (id: string) => request<any>(`/disease-assessments/${id}`),
  deleteDiseaseAssessment: (id: string) => request<any>(`/disease-assessments/${id}`, { method: 'DELETE' }),

  // Weather
  getFarmWeather: (farmId: string) => request<any>(`/farms/${farmId}/weather`),
  refreshFarmWeather: (farmId: string) => request<any>(`/farms/${farmId}/weather/refresh`, { method: 'POST' }),
  getFarmAlerts: (farmId: string) => request<any>(`/farms/${farmId}/alerts`),
  getAlertPreferences: (farmId: string) => request<any>(`/farms/${farmId}/alert-preferences`),
  updateAlertPreferences: (farmId: string, body: any) => request<any>(`/farms/${farmId}/alert-preferences`, { method: 'PUT', body: JSON.stringify(body) }),

  // Recommendations
  recommendCrops: (farmId: string, body: any) => request<any>(`/farms/${farmId}/recommendations/crops`, { method: 'POST', body: JSON.stringify(body) }),
  getRecommendations: () => request<any[]>('/recommendations'),

  // Assistant
  getConversations: () => request<any[]>('/conversations'),
  getConversation: (id: string) => request<any>(`/conversations/${id}`),
  createConversation: (body: any) => request<any>('/conversations', { method: 'POST', body: JSON.stringify(body) }),
  sendMessage: (conversationId: string, body: any) => request<any>(`/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify(body) }),
  deleteConversation: (id: string) => request<any>(`/conversations/${id}`, { method: 'DELETE' }),

  // History & Settings
  getHistory: (type: string = 'all') => request<any>(`/history?type=${type}`),
  getSettings: () => request<any>('/settings'),
  updateSettings: (body: any) => request<any>('/settings', { method: 'PATCH', body: JSON.stringify(body) }),
  exportAccountData: () => {
    window.location.href = `${API_BASE}/account/export`;
  },
  deleteAccount: (password: string) => request<any>('/account', { method: 'DELETE', body: JSON.stringify({ confirmation: 'DELETE_MY_ACCOUNT', password }) }),

  // Health & Ready
  getHealth: () => request<any>('/health'),
  getReady: () => request<any>('/ready'),
};

