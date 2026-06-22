import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'oil-web-default-secret-change-in-production'
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

  if (STATIC_EXTS.test(pathname)) return NextResponse.next();
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next();

  const token = req.cookies.get('oil-web-token')?.value;
  if (!token) {
    if (pathname === '/') return NextResponse.redirect(new URL('/login', req.url));
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const res = NextResponse.next();
    res.headers.set('x-pi-user-id', String(payload.userId as number));
    res.headers.set('x-pi-user-email', (payload.email as string) || '');
    res.headers.set('x-pi-user-role', (payload.role as string) || 'user');
    return res;
  } catch {
    const res = pathname === '/'
      ? NextResponse.redirect(new URL('/login', req.url))
      : NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    res.cookies.delete('oil-web-token');
    return res;
  }
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
