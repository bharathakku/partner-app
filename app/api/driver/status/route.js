import { NextResponse } from 'next/server';

// Get the API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';

export async function POST(request) {
  try {
    // Get the authorization token from the request headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.error('No authorization token provided');
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    if (typeof body.isOnline === 'undefined') {
      console.error('isOnline is required in the request body');
      return NextResponse.json(
        { error: 'isOnline is required' },
        { status: 400 }
      );
    }

    const url = `${API_BASE_URL}/api/drivers/me/online`;
    console.log('Making request to:', url);
    console.log('With token:', token ? 'Token present' : 'No token');
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ isOnline: body.isOnline })
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      let errorBody;
      try {
        errorBody = await response.text();
        console.error('Error response body:', errorBody);
        errorBody = JSON.parse(errorBody);
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      
      throw new Error(errorBody?.error || errorBody?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json().catch(e => {
      console.error('Error parsing success response:', e);
      return { success: true };
    });
    
    console.log('Success response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update status' },
      { status: error.status || 500 }
    );
  }
}
