import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans">
      {/* ===== NAV ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
              <span className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-xs text-white font-bold">O</span>
              Oil Web
            </Link>
            <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
              <a href="#features" className="hover:text-white transition-colors">功能</a>
              <a href="#testimonials" className="hover:text-white transition-colors">评价</a>
              <a href="#" className="hover:text-white transition-colors">定价</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5">登录</Link>
            <Link href="/register" className="text-sm bg-white text-black font-medium px-4 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors">免费注册</Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            能源领域 AI 专家平台
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            从地质发现到
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
              规模开发
            </span>
          </h1>
          
          <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed mb-10">
            AI 圆桌辩论 + 勘探开发方案生成 + 学者谱系蒸馏——<br />
            把 187 位专家的方法论装进你的工具箱
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="bg-white text-black font-medium px-7 py-3 rounded-xl text-sm hover:bg-zinc-200 transition-all shadow-lg shadow-white/10">
              免费开始使用
            </Link>
            <Link href="/login" className="border border-white/10 text-white font-medium px-7 py-3 rounded-xl text-sm hover:bg-white/5 transition-all">
              登录已有账号
            </Link>
          </div>
        </div>
      </section>

      {/* ===== LINEAGE BAR ===== */}
      <section className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm text-zinc-500">
          <span className="text-zinc-600 text-xs uppercase tracking-widest font-semibold">智识锚点</span>
          <span className="flex items-center gap-2"><span className="text-white font-semibold">109</span> 位中方学者</span>
          <span className="w-px h-4 bg-white/10 hidden sm:block" />
          <span className="flex items-center gap-2"><span className="text-white font-semibold">78</span> 位国际学者</span>
          <span className="w-px h-4 bg-white/10 hidden sm:block" />
          <span className="flex items-center gap-2"><span className="text-white font-semibold">7</span> 圆桌席位</span>
          <span className="w-px h-4 bg-white/10 hidden sm:block" />
          <span className="flex items-center gap-2"><span className="text-white font-semibold">9</span> 资源类型覆盖</span>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">找得到 · 采得出 · 稳得住 · 算得过账</h2>
            <p className="text-zinc-400 max-w-lg mx-auto">覆盖勘探开发全生命周期——从第一张地震剖面到最后一桶油的经济决策</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🔍', title: '勘探开发方案生成', desc: '输入区块参数，AI 自动生成从参数井到先导试验的一体化方案，十个模块 G1-G4 门禁' },
              { icon: '🧠', title: '专家圆桌辩论', desc: '6 席位结构化辩论，中外学者智识锚点，交叉质询 + 共识输出 + 验证清单' },
              { icon: '📊', title: '学者谱系蒸馏', desc: '任意学者名单按方法论自动分类，生成谱系报告，看清每一群人在回答什么问题' },
              { icon: '⚡', title: 'AI 编程辅助', desc: '代码、文档、数据分析——DeepSeek V4 驱动，支持实时流式对话与文件操作' },
            ].map((f) => (
              <div key={f.title} className="group bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all">
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-sm mb-2">{f.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 px-6 bg-white/[0.01] border-y border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">一句话启动，三分钟出方案</h2>
          <p className="text-zinc-400 mb-16">不需要培训，不需要模板，用自然语言描述你的需求</p>
          
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              { step: '01', title: '注册账号', desc: '邮箱注册，30 秒完成。你的 workspace 独立隔离，session 自动保存。' },
              { step: '02', title: '描述目标', desc: '「鄂尔多斯深部煤层气从参数井到先导试验」——AI 理解你的领域语言。' },
              { step: '03', title: '获得方案', desc: '勘探方案、圆桌辩论、谱系报告——你需要什么形式，AI 输出什么格式。' },
            ].map((s) => (
              <div key={s.step} className="group">
                <div className="text-xs text-blue-400 font-mono mb-3">{s.step}</div>
                <h3 className="font-semibold text-sm mb-2">{s.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-16">能源专家这样说</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: '张教授', role: '石油地质学家 · 某油田研究院', text: '把 46 位开发工程学者丢进去，几分钟出了按方法论分类的谱系报告，分类比手动还准。以前一周的工作现在一杯咖啡的时间。' },
              { name: '李总工', role: '煤层气公司技术负责人', text: '深部煤层气圆桌直接输出 15 条验证清单。我们照着做了 3 条，就找到了之前漏掉的盖层风险。这就是把专家的脑回路程序化了。' },
              { name: '王博士', role: '勘探开发研究院', text: '以前写勘探方案要一周，现在描述清楚区块条件，AI 输出框架，我再修改——一天搞定。不是替代专家，是放大专家的效率。' },
            ].map((t) => (
              <div key={t.name} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4 text-yellow-500 text-xs">★★★★★</div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-6">"{t.text}"</p>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">别让方案停留在 Word 里</h2>
          <p className="text-zinc-400 mb-10">用 187 位专家的方法论，把你的地质认识变成可执行的开发方案</p>
          <Link href="/register" className="inline-flex bg-white text-black font-medium px-8 py-3.5 rounded-xl text-sm hover:bg-zinc-200 transition-all shadow-lg shadow-white/10">
            免费注册 →
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-gradient-to-br from-blue-500 to-cyan-400 rounded flex items-center justify-center text-[8px] text-white font-bold">O</span>
            Oil Web © 2026
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-zinc-400 transition-colors">服务条款</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">隐私政策</a>
            <a href="mailto:hello@oilweb.ai" className="hover:text-zinc-400 transition-colors">联系我们</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
