'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string | null;
  nickname: string | null;
  role: string;
  subscription: { status: string; plan: string };
}

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (!user) return null;

  const initials = (user.nickname || user.email || '用').slice(0, 2).toUpperCase();

  return (
    <div ref={menuRef} style={{ position: 'relative', marginLeft: 'auto' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 36, padding: '0 12px',
          background: open ? 'var(--bg-hover)' : 'none',
          border: 'none',
          borderLeft: '1px solid var(--border)',
          color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: 12,
          transition: 'color 0.12s, background 0.12s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 22, height: 22, borderRadius: 6,
          background: 'var(--accent)', color: '#fff',
          fontSize: 10, fontWeight: 600,
        }}>
          {initials}
        </span>
        <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user.nickname || user.email}
        </span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 42, right: 0,
          width: 220,
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
          zIndex: 400,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
              {user.nickname || '用户'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {user.email || 'WeChat user'}
            </div>
            <div style={{
              display: 'inline-block', marginTop: 6,
              padding: '2px 8px', borderRadius: 4,
              background: user.subscription?.status === 'active' ? '#ecfdf5' : '#fef2f2',
              color: user.subscription?.status === 'active' ? '#059669' : '#dc2626',
              fontSize: 10, fontWeight: 500,
            }}>
              {user.subscription?.plan || '免费'} · {user.subscription?.status === 'active' ? '已激活' : '未激活'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '10px 14px',
              background: 'none', border: 'none',
              color: '#dc2626', cursor: 'pointer',
              fontSize: 12, textAlign: 'left',
              transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
