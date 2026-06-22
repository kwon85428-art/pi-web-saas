import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'oil-web-default-secret-change-in-production'
);

const PUBLIC_PATHS = [
  '/',
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

  if (STATIC_EXTS.test(pathname)) return NextResponse.next();

  const token = req.cookies.get('oil-web-token')?.value;
  const isAuth = !!token;

  // Verify token if present
  let userId: number | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      userId = payload.userId as number;
    } catch {
      // Invalid token — clear it below
    }
  }

  // Public paths
  if (PUBLIC_PATHS.some(p => pathname === p || (p !== '/' && pathname.startsWith(p)))) {
    // If logged in and on landing/login/register, redirect to chat
    if (userId && (pathname === '/' || pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/chat', req.url));
    }
    return NextResponse.next();
  }

  // Auth required
  if (!userId) {
    if (pathname === '/chat' || pathname.startsWith('/chat/')) return NextResponse.redirect(new URL('/login', req.url));
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const res = NextResponse.next();
  res.headers.set('x-pi-user-id', String(userId));
  return res;
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
