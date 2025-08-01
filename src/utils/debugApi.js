// Debug utility để kiểm tra API calls
export const debugTokenAndHeaders = () => {
  const token = localStorage.getItem('accessToken');
  console.log('Debug Token Info:', {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenType: typeof token,
    tokenPreview: token ? token.substring(0, 50) + '...' : null,
    rawToken: token,
    isStringified: token && token.startsWith('"') && token.endsWith('"')
  });
};

export const testAdminEndpoint = async () => {
  try {
    debugTokenAndHeaders();
    
    const token = localStorage.getItem('accessToken');
    const cleanToken = token ? token.replace(/^["']|["']$/g, '') : null;
    
    console.log('Testing direct fetch to admin endpoint...');
    
    const response = await fetch('http://localhost:8081/api/v1/admin/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': cleanToken ? `Bearer ${cleanToken}` : ''
      }
    });
    
    console.log('Direct fetch result:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
    
    return response;
  } catch (error) {
    console.error('Direct fetch error:', error);
    return null;
  }
};
