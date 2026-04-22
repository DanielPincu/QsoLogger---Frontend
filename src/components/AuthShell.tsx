import type { ReactNode } from 'react'

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="app-shell flex items-center justify-center">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="radio-panel panel-padding hidden min-h-[560px] flex-col justify-between lg:flex">
          <div>
            <div className="label-caps mb-4">QSO Logger Control Deck</div>
            <h1 className="max-w-lg text-5xl font-semibold leading-tight text-white">
              Precision logging for operators who live on the band edge.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              Track contacts, monitor confirmations, and navigate your station data through a modern cockpit with a warm radio-room glow.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/8 p-4">
              <div className="label-caps text-emerald-200">Signal</div>
              <div className="mt-2 text-2xl font-semibold text-white">Stable</div>
              <p className="mt-2 text-sm text-emerald-100/80">Fast auth flow with zero API changes.</p>
            </div>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/8 p-4">
              <div className="label-caps text-amber-100">Grid</div>
              <div className="mt-2 text-2xl font-semibold text-white">Locator Ready</div>
              <p className="mt-2 text-sm text-amber-100/80">Operator identity stays visible across the app.</p>
            </div>
            <div className="rounded-2xl border border-slate-500/30 bg-slate-800/60 p-4">
              <div className="label-caps">Logbook</div>
              <div className="mt-2 text-2xl font-semibold text-white">Mission Focused</div>
              <p className="mt-2 text-sm text-slate-300">Built for mobile, tablet, and full desk operation.</p>
            </div>
          </div>
        </section>

        <section className="radio-panel panel-padding mx-auto w-full max-w-xl self-center">
          <div className="mb-8">
            <div className="label-caps mb-3">Secure Access</div>
            <h2 className="text-3xl font-semibold text-white">{title}</h2>
            <p className="mt-3 text-sm text-slate-400">{subtitle}</p>
          </div>
          {children}
        </section>
      </div>
    </div>
  )
}
