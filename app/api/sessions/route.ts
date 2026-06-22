import { NextResponse } from 'next/server';
import { listAllSessions } from '@/lib/session-reader';
import { withUser } from '@/lib/with-user';

export async function GET() {
  try {
    await withUser();
    const sessions = await listAllSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
