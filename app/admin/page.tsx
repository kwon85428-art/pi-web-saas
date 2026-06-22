'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  nickname: string;
  role: string;
  created_at: string;
  sub_status: string;
  sub_plan: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeSubs, setActiveSubs] = useState(0);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.status === 403) { router.push('/chat'); return; }
      const data = await res.json();
      setUsers(data.users);
      setTotalUsers(data.stats.totalUsers);
      setActiveSubs(data.stats.activeSubs);
    } catch {
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const updateUser = async (id: number, updates: Record<string, string>) => {
    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    loadUsers();
  };

  const toggleRole = (u: User) => {
    updateUser(u.id, { role: u.role === 'admin' ? 'user' : 'admin' });
  };

  const toggleSub = (u: User) => {
    updateUser(u.id, {
      subStatus: u.sub_status === 'active' ? 'inactive' : 'active',
      subPlan: u.sub_plan || 'free',
    });
  };

  if (loading) {
    return <div style={{ padding: 40, background: '#0d0d0d', color: '#888', minHeight: '100vh' }}>加载中...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', color: '#e0e0e0', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1e1e24', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>管理后台</h1>
          <span style={{ fontSize: 12, color: '#666' }}>Oil Web Admin</span>
        </div>
        <button onClick={() => router.push('/chat')} style={{ background: '#1a1a24', border: '1px solid #2a2a34', borderRadius: 8, color: '#888', cursor: 'pointer', padding: '6px 14px', fontSize: 12 }}>
          ← 返回聊天
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, padding: '24px' }}>
        {[
          { label: '总用户', value: totalUsers, color: '#3b82f6' },
          { label: '活跃订阅', value: activeSubs, color: '#10b981' },
          { label: '管理员', value: users.filter(u => u.role === 'admin').length, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: '#1a1a24', border: '1px solid #2a2a34', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div style={{ padding: '0 24px 40px' }}>
        <div style={{ background: '#1a1a24', border: '1px solid #2a2a34', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a34', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', color: '#666', fontWeight: 500, fontSize: 11 }}>ID</th>
                <th style={{ padding: '12px 16px', color: '#666', fontWeight: 500, fontSize: 11 }}>邮箱</th>
                <th style={{ padding: '12px 16px', color: '#666', fontWeight: 500, fontSize: 11 }}>昵称</th>
                <th style={{ padding: '12px 16px', color: '#666', fontWeight: 500, fontSize: 11 }}>角色</th>
                <th style={{ padding: '12px 16px', color: '#666', fontWeight: 500, fontSize: 11 }}>订阅</th>
                <th style={{ padding: '12px 16px', color: '#666', fontWeight: 500, fontSize: 11 }}>注册时间</th>
                <th style={{ padding: '12px 16px', color: '#666', fontWeight: 500, fontSize: 11 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #1e1e24' }}>
                  <td style={{ padding: '10px 16px', color: '#888', fontSize: 11 }}>{u.id}</td>
                  <td style={{ padding: '10px 16px' }}>{u.email}</td>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>{u.nickname}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 11,
                      background: u.role === 'admin' ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
                      color: u.role === 'admin' ? '#a78bfa' : '#888',
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 11,
                      background: u.sub_status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                      color: u.sub_status === 'active' ? '#34d399' : '#f87171',
                    }}>
                      {u.sub_plan} · {u.sub_status === 'active' ? '激活' : '停用'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#666', fontSize: 11 }}>
                    {u.created_at?.slice(0, 10)}
                  </td>
                  <td style={{ padding: '10px 16px', display: 'flex', gap: 6 }}>
                    <button onClick={() => toggleRole(u)} style={{
                      padding: '4px 10px', borderRadius: 6, border: '1px solid #2a2a34',
                      background: 'none', color: '#888', cursor: 'pointer', fontSize: 11,
                    }}>
                      {u.role === 'admin' ? '降级' : '升级'}
                    </button>
                    <button onClick={() => toggleSub(u)} style={{
                      padding: '4px 10px', borderRadius: 6, border: '1px solid #2a2a34',
                      background: 'none', color: '#888', cursor: 'pointer', fontSize: 11,
                    }}>
                      {u.sub_status === 'active' ? '停用' : '激活'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
