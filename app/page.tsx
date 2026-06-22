import Link from 'next/link';

const features = [
  { icon: '🔍', title: '勘探方案生成', desc: '输入区块参数，AI 自动生成从参数井到先导试验的一体化勘探开发方案' },
  { icon: '🧠', title: '专家圆桌辩论', desc: '187 位中外学者智识锚点，6 席位结构化辩论，按 找得到→采得出→稳得住→算得过账 输出决策框架' },
  { icon: '📊', title: '学者谱系蒸馏', desc: '任意学者名单 → 按方法论自动分类，生成谱系报告，看清每一群人在回答什么问题' },
  { icon: '🛠️', title: 'AI 编程助手', desc: '代码、文档、数据分析——你的能源领域全能 AI 搭档，DeepSeek 驱动' },
];

const testimonials = [
  { name: '张教授', role: '石油地质学家', text: '把 46 位开发工程学者的名字丢进去，几分钟就出了一份按方法论分类的谱系报告，分类比我手动的还准。' },
  { name: '李总', role: '煤层气公司技术负责人', text: '深部煤层气的圆桌辩论直接输出了 15 条验证清单，我们照着做了 3 条，就找到了之前漏掉的盖层风险。' },
  { name: '王博士', role: '油田研究院', text: '以前写勘探方案要一周，现在描述清楚区块条件，AI 输出框架，我再修改——一天搞定。' },
];

export default function LandingPage() {
  return (
    <div style={{ background: '#0a0e17', color: '#e0e6f0', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
          <span style={{ color: '#60a5fa' }}>Oil</span> Web
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, padding: '6px 16px', borderRadius: 8, transition: 'all .15s' }}>登录</Link>
          <Link href="/register" style={{ background: '#3b82f6', color: '#fff', textDecoration: 'none', fontSize: 14, padding: '8px 20px', borderRadius: 8, fontWeight: 500, transition: 'all .15s' }}>免费注册</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', padding: '4px 16px', borderRadius: 20, fontSize: 13, marginBottom: 24, border: '1px solid rgba(59,130,246,0.2)' }}>
          能源领域 AI 专家平台
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 20 }}>
          找得到 · 采得出<br />
          <span style={{ color: '#60a5fa' }}>稳得住 · 算得过账</span>
        </h1>
        <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 36px' }}>
          从地质发现到规模开发——AI 圆桌辩论 + 勘探方案生成 + 学者谱系蒸馏，把 187 位专家的方法论装进你的工具箱
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{ background: '#3b82f6', color: '#fff', textDecoration: 'none', padding: '14px 32px', borderRadius: 10, fontSize: 16, fontWeight: 600, transition: 'all .15s' }}>
            免费开始使用 →
          </Link>
          <Link href="/login" style={{ background: 'rgba(255,255,255,0.06)', color: '#e0e6f0', textDecoration: 'none', padding: '14px 32px', borderRadius: 10, fontSize: 16, fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)', transition: 'all .15s' }}>
            登录已有账号
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {features.map((f) => (
            <div key={f.title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, color: '#f1f5f9' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 40, color: '#f1f5f9' }}>能源专家这样说</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {testimonials.map((t) => (
            <div key={t.name} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
              <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 16 }}>"{t.text}"</p>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{t.name}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '60px 24px 80px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, color: '#f1f5f9' }}>别让勘探方案停留在 Word 里</h2>
        <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 32 }}>187 位专家的方法论，几分钟生成你的勘探开发方案</p>
        <Link href="/register" style={{ background: '#3b82f6', color: '#fff', textDecoration: 'none', padding: '14px 36px', borderRadius: 10, fontSize: 16, fontWeight: 600 }}>
          免费注册 →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: '#475569' }}>
        © 2026 Oil Web · 能源 AI 专家平台
      </footer>
    </div>
  );
}
