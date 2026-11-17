const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

/**
 * Helper to get authorization token from localStorage
 */
export const getToken = () => localStorage.getItem('token');

/**
 * Standard HTTP request wrapper with automatic Authorization and error handling
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers = {
    ...(options.headers || {})
  };

  const token = getToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do not set Content-Type if sending FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || (data?.errors ? JSON.stringify(data.errors) : `Request failed with status ${response.status}`);
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to backend server. Please verify backend is running on port 3000.');
    }
    throw err;
  }
}

/**
 * Streaming RAG response using Fetch API ReadableStream (supporting POST + SSE + Bearer token)
 */
export async function streamRagAnswer({
  query,
  limit = 5,
  documentId = undefined,
  onStatus,
  onSources,
  onToken,
  onDone,
  onError
}) {
  const token = getToken();
  const url = `${API_BASE}/rag/stream`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        query,
        limit,
        ...(documentId ? { documentId } : {})
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      throw new Error(errJson?.message || `Streaming request failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let completed = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || ''; // Keep incomplete part in buffer

      for (const eventBlock of events) {
        if (!eventBlock.trim()) continue;

        const lines = eventBlock.split('\n');
        let eventType = 'message';
        let dataStr = '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.replace('event:', '').trim();
          } else if (line.startsWith('data:')) {
            dataStr += line.replace('data:', '').trim();
          }
        }

        let parsedData = null;
        try {
          parsedData = dataStr ? JSON.parse(dataStr) : null;
        } catch {
          parsedData = dataStr;
        }

        if (eventType === 'status' && onStatus) {
          onStatus(parsedData?.message || parsedData);
        } else if (eventType === 'sources' && onSources) {
          onSources(parsedData?.sources || parsedData);
        } else if (eventType === 'token' && onToken) {
          // The backend sends { text }; also accept { token } for compatibility.
          onToken(parsedData?.text ?? parsedData?.token ?? '');
        } else if (eventType === 'done' && onDone) {
          completed = true;
          onDone(parsedData);
        } else if (eventType === 'error') {
          completed = true;
          if (onError) onError(parsedData?.message || 'Error from stream');
        }
      }
    }

    if (!completed && onDone) onDone();
  } catch (err) {
    if (onError) onError(err.message || 'Stream connection failed');
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: () => apiRequest('/health'),

  // Auth
  auth: {
    login: (credentials) => apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    register: (userData) => apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    getProfile: () => apiRequest('/profile'),
    checkAdmin: () => apiRequest('/admin')
  },

  // Documents
  documents: {
    getAll: () => apiRequest('/documents'),
    getById: (id) => apiRequest(`/documents/${id}`),
    upload: (file) => {
      const formData = new FormData();
      formData.append('document', file);
      return apiRequest('/documents/upload', {
        method: 'POST',
        body: formData
      });
    },
    delete: (id) => apiRequest(`/documents/${id}`, {
      method: 'DELETE'
    })
  },

  // Chunks
  chunks: {
    process: (documentId) => apiRequest(`/chunks/${documentId}/process`, {
      method: 'POST'
    }),
    getByDocumentId: (documentId) => apiRequest(`/chunks/${documentId}`)
  },

  // Embeddings
  embeddings: {
    generate: (documentId) => apiRequest(`/embeddings/${documentId}/generate`, {
      method: 'POST'
    })
  },

  // Search
  search: {
    vector: ({ query, limit = 5, documentId }) => apiRequest('/search/vector', {
      method: 'POST',
      body: JSON.stringify({
        query,
        limit,
        ...(documentId ? { documentId } : {})
      })
    }),
    hybrid: ({ query, limit = 5, documentId }) => apiRequest('/search/hybrid', {
      method: 'POST',
      body: JSON.stringify({
        query,
        limit,
        ...(documentId ? { documentId } : {})
      })
    })
  },

  // RAG
  rag: {
    ask: ({ query, limit = 5, documentId }) => apiRequest('/rag/ask', {
      method: 'POST',
      body: JSON.stringify({
        query,
        limit,
        ...(documentId ? { documentId } : {})
      })
    }),
    stream: streamRagAnswer
  },

  // Agents
  agents: {
    runRagAgent: ({ query, documentId }) => apiRequest('/agent/run', {
      method: 'POST',
      body: JSON.stringify({
        query,
        ...(documentId ? { documentId } : {})
      })
    }),
    runMultiAgent: ({ query, documentId }) => apiRequest('/multi-agent/run', {
      method: 'POST',
      body: JSON.stringify({
        query,
        ...(documentId ? { documentId } : {})
      })
    })
  },

  // MCP
  mcp: {
    getTools: () => apiRequest('/mcp/tools'),
    search: ({ query, limit = 5, documentId }) => apiRequest('/mcp/search', {
      method: 'POST',
      body: JSON.stringify({
        query,
        limit,
        ...(documentId ? { documentId } : {})
      })
    }),
    listDocuments: () => apiRequest('/mcp/documents')
  },

  // Evaluations (Admin only)
  evaluations: {
    run: ({ k = 5 } = {}) => apiRequest('/evaluations/run', {
      method: 'POST',
      body: JSON.stringify({ k })
    })
  }
};

export default api;
