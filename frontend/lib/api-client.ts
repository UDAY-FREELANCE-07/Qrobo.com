const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  data?: any;
}

export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  const { data, headers, ...customConfig } = options;
  
  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // Required to send HttpOnly cookies securely to the backend
    ...customConfig,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  // Remove leading slash if present to avoid double slash
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${formattedEndpoint}`;
  
  let response;
  try {
      response = await fetch(url, config);
  } catch (error) {
      throw new Error('Network error. Please check your connection to the server.');
  }

  if (response.status === 204) {
    return null; // No Content
  }

  const responseData = await response.json();

  if (!response.ok) {
    const errorMessage = responseData.error?.message || responseData.message || responseData.error || 'An unexpected error occurred';
    const error = new Error(errorMessage) as any;
    error.status = response.status;
    error.code = responseData.error?.code;
    
    // Throw error to be caught by the caller
    throw error;
  }

  // If the backend wraps responses in { status: 'success', data: ... }
  if (responseData && typeof responseData === 'object' && ('data' in responseData)) {
      return responseData.data;
  }

  return responseData;
}
