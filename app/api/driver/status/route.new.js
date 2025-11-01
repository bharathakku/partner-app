import { NextResponse } from 'next/server';

// Get the API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';

export async function POST(request) {
  try {
    // Get the authorization token from the request headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const { isOnline } = await request.json();

    // Make request to your backend API
    const response = await fetch(`${API_BASE_URL}/api/partners/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isOnline })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update status');
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating driver status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update status' },
      { status: 500 }
    );
  }
}
