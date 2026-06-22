'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number; email: string; nickname: string; role: string;
  created_at: string; sub_status: string; sub_plan: string; sessions?: number;
}

type Tab = 'users' | 'analytics';

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeSubs, setActiveSubs] = useState(0);
  const [analytics, setAnalytics] = useState<any>(null);

  const loadUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.status === 403) { router.push('/chat'); return; }
    const data = await res.json();
    setUsers(data.users);
    setTotalUsers(data.stats.totalUsers);
    setActiveSubs(data.stats.activeSubs);
    setLoading(false);
  };

  const loadAnalytics = async () => {
    const res = await fetch('/api/admin/analytics');
    if (res.ok) setAnalytics(await res.json());
  };

  useEffect(() => { loadUsers(); loadAnalytics(); }, []);

  const updateUser = async (id: number, u: Record<string, string>) => {
    await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(u) });
    loadUsers(); loadAnalytics();
  };

  if (loading) return <div style={{ padding: 40, background: '#0d0d0d', color: '#888', minHeight: '100vh' }}>加载中...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', color: '#e0e0e0', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ borderBottom: '1px solid #1e1e24', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>管理后台</h1>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { key: 'users' as Tab, label: '用户管理' },
              { key: 'analytics' as Tab, label: '数据分析' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13,
                background: tab === t.key ? '#3b82f6' : 'transparent',
                color: tab === t.key ? '#fff' : '#888',
              }}>{t.label}</button>
            ))}
          </div>
        </div>
        <button onClick={() => router.push('/chat')} style={{ background: '#1a1a24', border: '1px solid #2a2a34', borderRadius: 8, color: '#888', cursor: 'pointer', padding: '6px 14px', fontSize: 12 }}>
          ← 返回聊天
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 16, padding: '24px' }}>
        {[
          { label: '总用户', value: totalUsers, color: '#3b82f6' },
          { label: '活跃订阅', value: activeSubs, color: '#10b981' },
          { label: '总会话', value: analytics?.totalSessions || 0, color: '#f59e0b' },
          { label: '管理员', value: users.filter(u => u.role === 'admin').length, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: '#1a1a24', border: '1px solid #2a2a34', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Users tab */}
      {tab === 'users' && (
        <div style={{ padding: '0 24px 40px' }}>
          <div style={{ background: '#1a1a24', border: '1px solid #2a2a34', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a34', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', color: '#666', fontWeight: 500, fontSize: 11 }}>ID</th>
                  <th style={{ padding: '12px 16px', color: '#666', fontWeight: 500, fontSize: 11 }}>邮箱</th>
                  <th style={{ padding: '12px 16px', color: '#666', fontWeight: 500, fontSize: 11 }}>角色</th>
                  <th style={{ padding: '12px 16px', color: '#666', fontWeight: 500, fontSize: 11 }}>订阅</th>
                  <th style={{ padding: '12px 16px', color: '#666', fontWeight: 500, fontSize: 11 }}>会话数</th>
                  <th style={{ padding: '12px 16px', color: '#666', fontWeight: 500, fontSize: 11 }}>注册时间</th>
                  <th style={{ padding: '12px 16px', color: '#666', fontWeight: 500, fontSize: 11 }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #1e1e24' }}>
                    <td style={{ padding: '10px 16px', color: '#888', fontSize: 11 }}>{u.id}</td>
                    <td style={{ padding: '10px 16px' }}>{u.email}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: u.role === 'admin' ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)', color: u.role === 'admin' ? '#a78bfa' : '#888' }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: u.sub_status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)', color: u.sub_status === 'active' ? '#34d399' : '#f87171' }}>{u.sub_plan} · {u.sub_status === 'active' ? '激活' : '停用'}</span>
                    </td>
                    <td style={{ padding: '10px 16px', color: '#f59e0b' }}>{u.sessions ?? '-'}</td>
                    <td style={{ padding: '10px 16px', color: '#666', fontSize: 11 }}>{u.created_at?.slice(0, 10)}</td>
                    <td style={{ padding: '10px 16px', display: 'flex', gap: 6 }}>
                      <button onClick={() => updateUser(u.id, { role: u.role === 'admin' ? 'user' : 'admin' })} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #2a2a34', background: 'none', color: '#888', cursor: 'pointer', fontSize: 11 }}>{u.role === 'admin' ? '降级' : '升级'}</button>
                      <button onClick={() => updateUser(u.id, { subStatus: u.sub_status === 'active' ? 'inactive' : 'active' })} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #2a2a34', background: 'none', color: '#888', cursor: 'pointer', fontSize: 11 }}>{u.sub_status === 'active' ? '停用' : '激活'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics tab */}
      {tab === 'analytics' && analytics && (
        <div style={{ padding: '0 24px 40px' }}>
          {/* Registration trend */}
          <div style={{ background: '#1a1a24', border: '1px solid #2a2a34', borderRadius: 12, padding: 24, marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#ccc' }}>近 7 天注册趋势</h3>
            <div style={{ display: 'flex', alignItems: 'end', gap: 8, height: 120 }}>
              {analytics.dailyRegistrations?.length > 0 ? analytics.dailyRegistrations.map((d: any) => {
                const max = Math.max(...analytics.dailyRegistrations.map((x: any) => x.count), 1);
                const h = (d.count / max) * 100;
                return (
                  <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600 }}>{d.count}</span>
                    <div style={{ width: '100%', height: h, background: 'linear-gradient(180deg, #3b82f6, #1d4ed8)', borderRadius: '4px 4px 0 0', minHeight: d.count > 0 ? 4 : 0 }} />
                    <span style={{ fontSize: 10, color: '#666' }}>{d.day.slice(5)}</span>
                  </div>
                );
              }) : <span style={{ color: '#666', fontSize: 13 }}>暂无数据</span>}
            </div>
          </div>

          {/* Subscription breakdown */}
          <div style={{ background: '#1a1a24', border: '1px solid #2a2a34', borderRadius: 12, padding: 24, marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#ccc' }}>订阅分布</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              {analytics.subscriptionBreakdown?.map((s: any) => (
                <div key={s.plan + s.status} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.status === 'active' ? '#10b981' : '#f87171' }}>{s.count}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{s.plan} · {s.status === 'active' ? '激活' : '停用'}</div>
                </div>
              ))}
              {(!analytics.subscriptionBreakdown || analytics.subscriptionBreakdown.length === 0) && <span style={{ color: '#666', fontSize: 13 }}>暂无数据</span>}
            </div>
          </div>

          {/* User activity table */}
          <div style={{ background: '#1a1a24', border: '1px solid #2a2a34', borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#ccc' }}>用户活跃度</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a34', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', color: '#666', fontWeight: 500, fontSize: 11 }}>用户</th>
                  <th style={{ padding: '8px 12px', color: '#666', fontWeight: 500, fontSize: 11 }}>会话数</th>
                  <th style={{ padding: '8px 12px', color: '#666', fontWeight: 500, fontSize: 11 }}>活跃度</th>
                </tr>
              </thead>
              <tbody>
                {[...users].sort((a, b) => (b.sessions || 0) - (a.sessions || 0)).slice(0, 10).map(u => {
                  const max = Math.max(...users.map(x => x.sessions || 0), 1);
                  const pct = ((u.sessions || 0) / max) * 100;
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #1e1e24' }}>
                      <td style={{ padding: '8px 12px' }}>{u.email}</td>
                      <td style={{ padding: '8px 12px', color: '#f59e0b', fontWeight: 600 }}>{u.sessions || 0}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ height: 6, background: '#1e1e24', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: pct > 50 ? '#3b82f6' : pct > 20 ? '#f59e0b' : '#6b7280', borderRadius: 3, transition: 'width 0.5s' }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
