'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SessionItem {
  id: string;
  cwd: string;
  firstMessage: string;
  modified: string;
  messageCount: number;
}

const suggestionCards = [
  {
    icon: '🔍',
    title: '勘探方案生成',
    desc: '输入区块参数，AI 生成从参数井到先导试验的一体化方案',
    prompt: '帮我生成一个鄂尔多斯盆地深部煤层气的勘探开发一体化方案',
  },
  {
    icon: '🧠',
    title: '专家圆桌辩论',
    desc: '6 席位结构化辩论，中西学者锚点，交叉质询输出决策框架',
    prompt: '开一个圆桌：中国深部煤层气从找到到规模开发需要跨越哪些门槛？',
  },
  {
    icon: '📊',
    title: '学者谱系蒸馏',
    desc: '任意学者名单按方法论自动分类，生成谱系报告',
    prompt: '帮我把这组学者做谱系蒸馏',
  },
  {
    icon: '⚡',
    title: '代码开发助手',
    desc: '代码编写、文档处理、数据分析——你的全能 AI 搭档',
    prompt: '帮我写一个 Python 脚本来分析测井数据',
  },
];

export default function ChatPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) setUser(d.user);
      else router.push('/login');
    }).catch(() => router.push('/login'));

    fetch('/api/sessions').then(r => r.json()).then(d => {
      setSessions(d.sessions || []);
    }).catch(() => {});
  }, [router]);

  const handleSend = useCallback((text: string) => {
    if (!text.trim()) return;
    // Navigate to full app for actual chat
    window.location.href = '/chat/full?prompt=' + encodeURIComponent(text);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleNewChat = () => {
    setActiveSession(null);
    setInput('');
  };

  const handleCardClick = (prompt: string) => {
    window.location.href = '/chat/full?prompt=' + encodeURIComponent(prompt);
  };

  const initials = (user?.nickname || user?.email || 'U').slice(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', height: '100dvh', background: '#0d0d0d', color: '#e0e0e0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* ============ SIDEBAR ============ */}
      <div style={{
        width: sidebarOpen ? 260 : 0,
        minWidth: sidebarOpen ? 260 : 0,
        background: '#111114',
        borderRight: '1px solid #1e1e22',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
      }}>
        {/* Logo + New Chat */}
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 24, height: 24, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>O</span>
              Oil Web
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 4, borderRadius: 6 }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1e1e28'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <button
            onClick={handleNewChat}
            style={{
              width: '100%', padding: '10px 14px',
              background: '#1a1a20', border: '1px solid #2a2a32',
              borderRadius: 10, color: '#c0c0c8', cursor: 'pointer',
              fontSize: 13, textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#222230'; e.currentTarget.style.borderColor = '#3b82f6'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1a1a20'; e.currentTarget.style.borderColor = '#2a2a32'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            新对话
          </button>
        </div>

        {/* Session list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSession(s.id)}
              style={{
                width: '100%', padding: '10px 12px',
                background: activeSession === s.id ? '#1e1e28' : 'transparent',
                border: 'none', borderRadius: 8,
                color: activeSession === s.id ? '#e0e0e0' : '#888',
                cursor: 'pointer', fontSize: 12, textAlign: 'left',
                marginBottom: 2,
                transition: 'all 0.1s',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1e1e28'; }}
              onMouseLeave={e => { if (activeSession !== s.id) e.currentTarget.style.background = 'transparent'; }}
            >
              {s.firstMessage?.slice(0, 40) || '新对话'}
            </button>
          ))}
        </div>

        {/* User section */}
        {user && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #1e1e22' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff' }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.nickname || user.email}
                </div>
                <div style={{ fontSize: 10, color: '#666' }}>免费版</div>
              </div>
              <button
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 4 }}
                title="退出登录"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar closed: show expand button inline at top-left */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: 'fixed', top: 16, left: 16, zIndex: 50,
            width: 36, height: 36, borderRadius: 10,
            background: '#1a1a24', border: '1px solid #2a2a34',
            color: '#888', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      )}

      {/* ============ MAIN CONTENT ============ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', overflow: 'auto' }}>
        
        {/* Welcome */}
        <div style={{ textAlign: 'center', maxWidth: 640, width: '100%' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 28, letterSpacing: '-0.02em' }}>
            有什么我可以帮你的？
          </h1>

          {/* Input bar */}
          <div style={{
            display: 'flex', alignItems: 'center',
            background: '#1a1a24', border: '1px solid #2a2a34',
            borderRadius: 14, padding: '8px 16px',
            marginBottom: 32,
            transition: 'border-color 0.15s',
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(input); }}
              placeholder="输入消息，或点击下方建议卡片..."
              style={{
                flex: 1, background: 'none', border: 'none',
                color: '#e0e0e0', fontSize: 15, outline: 'none',
                padding: '8px 0',
              }}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              style={{
                width: 34, height: 34, borderRadius: 8,
                background: input.trim() ? '#3b82f6' : '#2a2a34',
                border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>

          {/* Suggestion cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {suggestionCards.map(card => (
              <button
                key={card.title}
                onClick={() => handleCardClick(card.prompt)}
                style={{
                  textAlign: 'left', padding: '18px 20px',
                  background: '#1a1a24', border: '1px solid #2a2a34',
                  borderRadius: 14, color: '#e0e0e0',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#222230'; e.currentTarget.style.borderColor = '#3b82f6'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#1a1a24'; e.currentTarget.style.borderColor = '#2a2a34'; }}
              >
                <div style={{ fontSize: 20, marginBottom: 8 }}>{card.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{card.title}</div>
                <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>{card.desc}</div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 32, fontSize: 11, color: '#555' }}>
            DeepSeek V4 Flash
          </div>
        </div>
      </div>
    </div>
  );
}
