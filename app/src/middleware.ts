import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Add a new header, this will change the incoming request headers
  // that you can read in getServerSideProps and API routes
  const requestHeaders = new Headers(req.headers);
  if (!process.env.AUTH_TOKEN) {
    throw "AUTH_TOKEN not set"
  }
  requestHeaders.set('authorization', process.env.AUTH_TOKEN);
  return NextResponse.next({
    request: {
      // Apply new request headers
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next|fonts|examples|svg|[\\w-]+\\.\\w+).*)'],
}
