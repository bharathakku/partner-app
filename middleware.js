import { NextResponse } from 'next/server';

// Allow partner app auth routes to render locally without external redirects
export function middleware() {
  return NextResponse.next();
}

// Still scope middleware to auth paths (no-op pass-through)
export const config = {
  matcher: ['/auth/:path*'],
};
