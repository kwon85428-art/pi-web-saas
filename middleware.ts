import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { setUserAgentDir } from '@/lib/workspace';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'pi-web-default-secret-change-in-production'
);

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/wechat',
  '/api/auth/logout',
  '/api/auth/providers',
  '/api/auth/all-providers',
];

const STATIC_EXTS = /\.(svg|png|jpg|jpeg|gif|ico|css|js|woff2?|ttf|eot)$/;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static assets
  if (STATIC_EXTS.test(pathname)) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check auth
  const token = req.cookies.get('pi-web-token')?.value;
  if (!token) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as number;
    // Set user's isolated agent data directory
    setUserAgentDir(userId);
    return NextResponse.next();
  } catch {
    const res = pathname === '/'
      ? NextResponse.redirect(new URL('/login', req.url))
      : NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    res.cookies.delete('pi-web-token');
    return res;
  }
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
