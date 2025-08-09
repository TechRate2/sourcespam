export async function apiRequest(method: string, url: string, data?: any) {
  const token = localStorage.getItem('accessToken');
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    
    try {
      const errorJson = JSON.parse(errorText);
      // Chỉ lấy message thuần, không có status code
      errorMessage = errorJson.message || errorText || 'Có lỗi xảy ra';
    } catch {
      errorMessage = errorText || 'Có lỗi xảy ra';
    }
    
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
}

export async function apiGet(url: string) {
  return apiRequest('GET', url);
}

export async function apiPost(url: string, data?: any) {
  return apiRequest('POST', url, data);
}

export async function apiPut(url: string, data?: any) {
  return apiRequest('PUT', url, data);
}

export async function apiDelete(url: string) {
  return apiRequest('DELETE', url);
}

export async function apiPatch(url: string, data?: any) {
  return apiRequest('PATCH', url, data);
}