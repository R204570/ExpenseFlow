const API_BASE = '/api';

async function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

// Auth API
export const authApi = {
  signup: async (email, password, name) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    return handleResponse(res);
  },

  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  me: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: await getAuthHeaders()
    });
    return handleResponse(res);
  }
};

// Expenses API
export const expensesApi = {
  create: async (data) => {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  list: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/expenses?${query}`, {
      headers: await getAuthHeaders()
    });
    return handleResponse(res);
  },

  get: async (id) => {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      headers: await getAuthHeaders()
    });
    return handleResponse(res);
  },

  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  delete: async (id) => {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders()
    });
    return handleResponse(res);
  },

  stats: async (period = 'month') => {
    const res = await fetch(`${API_BASE}/expenses/stats?period=${period}`, {
      headers: await getAuthHeaders()
    });
    return handleResponse(res);
  },

  addItems: async (id, items) => {
    const res = await fetch(`${API_BASE}/expenses/${id}/items`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ items })
    });
    return handleResponse(res);
  }
};

// Splits API
export const splitsApi = {
  create: async (expenseId, data) => {
    const res = await fetch(`${API_BASE}/splits/${expenseId}`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  get: async (expenseId) => {
    const res = await fetch(`${API_BASE}/splits/${expenseId}`, {
      headers: await getAuthHeaders()
    });
    return handleResponse(res);
  }
};

// AI API
export const aiApi = {
  processReceipt: async (text) => {
    const res = await fetch(`${API_BASE}/ai/process-receipt`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ text })
    });
    return handleResponse(res);
  }
};

// Upload API
export const uploadApi = {
  uploadReceipt: async (file) => {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('image', file);
    
    const res = await fetch(`${API_BASE}/upload/receipt`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    return handleResponse(res);
  }
};
