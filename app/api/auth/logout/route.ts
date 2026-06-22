import { NextResponse } from 'next/server';
import { clearAuthCookie, getCurrentUser } from '@/lib/auth';
import { destroySession } from '@/lib/auth';

export async function POST() {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('pi-web-token')?.value;
    if (token) {
      destroySession(token);
    }
    await clearAuthCookie();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Logout error:', e);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
