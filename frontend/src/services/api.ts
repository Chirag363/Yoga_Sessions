const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Types
export interface Session {
  _id: string;
  title: string;
  tags: string[];
  jsonUrl: string;
  content?: any;
  isDraft: boolean;
  isPublished: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  lastAutoSave?: string;
  author?: {
    username: string;
  };
}

export interface SessionResponse {
  sessions: Session[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export interface CreateSessionResponse {
  session: Session;
  message: string;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to create headers
const getHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
};

// Sessions API
export const sessionsAPI = {
  // Get public sessions (with search by tags)
  getPublicSessions: async (params: {
    page?: number;
    limit?: number;
    tags?: string;
  } = {}): Promise<SessionResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.tags) searchParams.append('tags', params.tags);

    const response = await fetch(
      `${API_BASE_URL}/sessions/public?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: getHeaders(false), // Public endpoint doesn't need auth
      }
    );

    return handleResponse(response);
  },

  // Get user's own sessions
  getMySessions: async (params: {
    page?: number;
    limit?: number;
    status?: 'draft' | 'published';
  } = {}): Promise<SessionResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.status) searchParams.append('status', params.status);

    const response = await fetch(
      `${API_BASE_URL}/sessions/my?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  },

  // Get a single public session
  getPublicSession: async (id: string): Promise<Session> => {
    const response = await fetch(
      `${API_BASE_URL}/sessions/public/${id}`,
      {
        method: 'GET',
        headers: getHeaders(false),
      }
    );

    return handleResponse(response);
  },

  // Get user's own session for editing
  getMySession: async (id: string): Promise<Session> => {
    const response = await fetch(
      `${API_BASE_URL}/sessions/my/${id}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  },

  // Create a new session
  createSession: async (sessionData: Partial<Session>) => {
    const response = await fetch(
      `${API_BASE_URL}/sessions`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(sessionData),
      }
    );

    return handleResponse(response);
  },

  // Update an existing session
  updateSession: async (
    id: string,
    sessionData: Partial<Session>
  ): Promise<Session> => {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${id}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(sessionData),
      }
    );

    return handleResponse(response);
  },

  // Delete a session
  deleteSession: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${id}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  },

  // Publish a session
  publishSession: async (id: string): Promise<Session> => {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${id}/publish`,
      {
        method: 'POST',
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  },
};

// Auth API
export const authAPI = {
  // Login
  login: async (email: string, password: string): Promise<{ token: string; user: any }> => {
    const response = await fetch(
      `${API_BASE_URL}/auth/login`,
      {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ email, password }),
      }
    );

    return handleResponse(response);
  },

  // Register
  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ token: string; user: any }> => {
    const response = await fetch(
      `${API_BASE_URL}/auth/register`,
      {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify(userData),
      }
    );

    return handleResponse(response);
  },

  // Get current user
  getCurrentUser: async (): Promise<any> => {
    const response = await fetch(
      `${API_BASE_URL}/auth/me`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  },
};
