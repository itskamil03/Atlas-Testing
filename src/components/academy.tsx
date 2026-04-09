export default function Academy() {
  const modules = [
    'Market Foundations',
    'Technical Mastery',
    'Algo Trading Fundamentals',
    'Automation',
    'Risk',
    'Psychology',
  ]

  const features = [
    {
      title: 'Automated Execution Algorithms',
      description: 'Designed to identify and act on high-probability opportunities across global markets.',
    },
    {
      title: 'Forex Intelligence Suite',
      description: 'AI-driven currency market signals, macro analysis, and volatility-aware strategies built for FX traders.',
    },
    {
      title: 'Crypto Quant Engine',
      description: 'Quantitative crypto strategies with momentum, mean-reversion, and risk-managed execution for digital asset markets.',
    },
    {
      title: 'Risk Management Engine',
      description: 'Integrated risk controls, position sizing, and drawdown management to protect capital while trading aggressively.',
    },
    {
      title: 'Portfolio & Performance Dashboard',
      description: 'Track trading performance, risk metrics, and portfolio allocations with intuitive analytics designed for professional traders.',
    },
  ]

  return (
    <section id="academy" className="py-16 md:py-32 bg-slate-50 dark:bg-slate-950/95">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">ATLAS Academy</p>
          <h2 className="mt-4 text-4xl font-semibold lg:text-5xl text-slate-950 dark:text-white">Master Trading Program</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            A structured institutional-grade learning path for Forex, Crypto, and Algorithmic Trading.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-slate-950/30">
            <p className="text-base leading-7 text-slate-700 dark:text-slate-300">
              ATLAS Academy combines market theory, technical analysis, automated strategy design, and practical risk management to help traders build and execute professional-grade systems.
            </p>
            <div className="rounded-3xl bg-slate-100 p-6 dark:bg-slate-950/80">
              <h3 className="text-xl font-semibold text-slate-950 dark:text-white">Program Focus</h3>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                Learn how to trade with discipline, build algos that adapt to market conditions, and deploy automation that supports both retail and institutional workflows.
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-slate-950/30">
            <h3 className="text-xl font-semibold text-slate-950 dark:text-white">Core Modules</h3>
            <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              {modules.map((module) => (
                <li key={module} className="flex items-start gap-3 rounded-2xl bg-slate-100 p-4 dark:bg-slate-950/80">
                  <span className="mt-1 inline-flex h-3 w-3 rounded-full bg-primary" />
                  <span>{module}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Designed for traders preparing to trade with institutional discipline, prop desk precision, and automated execution workflows.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-slate-950/30">
              <h3 className="text-base font-semibold text-slate-950 dark:text-white">{feature.title}</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
