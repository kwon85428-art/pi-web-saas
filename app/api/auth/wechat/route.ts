import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createToken, setAuthCookie, createSession } from '@/lib/auth';
import { getUserDataDir } from '@/lib/workspace';

/**
 * WeChat OAuth login.
 * Requires WECHAT_APP_ID and WECHAT_APP_SECRET env vars.
 *
 * Flow:
 * 1. GET  /api/auth/wechat?code=xxx  → exchange code for access_token + openid
 * 2. Returns JWT token if user exists or auto-creates one
 */
export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    if (!code) {
      // Return the WeChat OAuth URL for the client to redirect to
      const appId = process.env.WECHAT_APP_ID;
      if (!appId) {
        return NextResponse.json({
          error: '微信登录未配置',
          hint: 'Set WECHAT_APP_ID and WECHAT_APP_SECRET environment variables',
        }, { status: 501 });
      }
      const redirectUri = process.env.WECHAT_REDIRECT_URI || `${req.nextUrl.origin}/api/auth/wechat`;
      const state = Math.random().toString(36).substring(2);
      const wxUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
      return NextResponse.json({ url: wxUrl });
    }

    // Exchange code for access token
    const appId = process.env.WECHAT_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;
    if (!appId || !appSecret) {
      return NextResponse.json({ error: '微信登录未配置' }, { status: 501 });
    }

    const tokenRes = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`
    );
    const tokenData = await tokenRes.json();

    if (tokenData.errcode) {
      console.error('WeChat token error:', tokenData);
      return NextResponse.json({ error: '微信认证失败' }, { status: 401 });
    }

    const { openid, unionid, access_token } = tokenData;

    // Get user info
    const userRes = await fetch(
      `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}`
    );
    const userData = await userRes.json();

    if (userData.errcode) {
      console.error('WeChat userinfo error:', userData);
      return NextResponse.json({ error: '获取微信用户信息失败' }, { status: 401 });
    }

    // Find or create user
    let user = db.prepare('SELECT id, email, nickname, role FROM users WHERE wechat_openid = ?').get(openid) as any;

    if (!user) {
      const result = db.prepare(
        'INSERT INTO users (wechat_openid, wechat_unionid, nickname, avatar_url) VALUES (?, ?, ?, ?)'
      ).run(openid, unionid || null, userData.nickname, userData.headimgurl);

      const userId = result.lastInsertRowid as number;
      db.prepare('INSERT INTO subscriptions (user_id, status, plan) VALUES (?, ?, ?)').run(userId, 'inactive', 'free');
      user = { id: userId, email: null, nickname: userData.nickname, role: 'user' };

      // Create workspace
      getUserDataDir(userId);
    }

    const token = await createToken({ userId: user.id, email: user.email, role: user.role });
    createSession(user.id, token);
    await setAuthCookie(token);

    // Redirect to home (for OAuth flow) or return JSON (for API flow)
    if (req.headers.get('accept')?.includes('text/html')) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.json({ user: { id: user.id, email: user.email, nickname: userData.nickname, role: user.role } });
  } catch (e: any) {
    console.error('WeChat auth error:', e);
    return NextResponse.json({ error: '微信认证失败' }, { status: 500 });
  }
}
