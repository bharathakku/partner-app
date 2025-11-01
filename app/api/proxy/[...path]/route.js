import { NextResponse } from 'next/server';

// Helper to log requests and responses
function logRequest(method, url, body, status, responseData) {
  console.log('--- API Request ---');
  console.log('Method:', method);
  console.log('URL:', url);
  console.log('Request Body:', JSON.stringify(body, null, 2));
  console.log('Response Status:', status);
  console.log('Response Data:', JSON.stringify(responseData, null, 2));
  console.log('-------------------');
}

export async function POST(request, { params }) {
  const { path } = params;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://delivery-backend-0nsg.onrender.com/api';
  const targetUrl = `${apiBase.replace(/\/$/, '')}/auth/${path.join('/')}`;
  
  try {
    const body = await request.json();
    
    // Log the incoming request
    console.log('\n=== PROXY REQUEST ===');
    console.log('Target URL:', targetUrl);
    console.log('Method:', request.method);
    console.log('Headers:', JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));
    console.log('Body:', JSON.stringify(body, null, 2));
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        ...body,
        // Ensure we have all required fields with default values if needed
        name: body.name || '',
        email: body.email || '',
        phone: body.phone || '',
        password: body.password || '',
        captcha: body.captcha || 0,
        role: body.role || 'driver',
        userType: body.userType || 'driver',
        deviceType: body.deviceType || 'web',
        signupMethod: 'email',
        referrer: 'web-app'
      })
    });

    console.log('\n=== PROXY RESPONSE ===');
    console.log('Status:', response.status, response.statusText);
    
    let responseData;
    try {
      const text = await response.text();
      console.log('Raw response:', text);
      responseData = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      responseData = { 
        error: 'Invalid JSON response from server',
        details: e.message 
      };
    }
    
    console.log('Response data:', JSON.stringify(responseData, null, 2));
    console.log('=== END PROXY REQUEST ===\n');
    
    // Log the full request/response
    logRequest('POST', targetUrl, body, response.status, responseData);
    
    return new NextResponse(JSON.stringify(responseData), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse(JSON.stringify({ 
      message: 'Internal server error',
      error: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
