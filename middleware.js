import { NextResponse } from 'next/server';

export function middleware(request) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = NextResponse.next();
    addCorsHeaders(response);
    return response;
  }

  // For all other requests, add CORS headers
  const response = NextResponse.next();
  addCorsHeaders(response);
  return response;
}

function addCorsHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

export const config = {
  matcher: ['/api/:path*', '/auth/:path*'],
};
