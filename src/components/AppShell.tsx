import type { ReactNode } from 'react'
import Nav from './Nav'

export default function AppShell({
  children,
  title,
  eyebrow,
  description,
  actions,
}: {
  children: ReactNode
  title: string
  eyebrow?: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="app-shell">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
        <Nav />

        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            {eyebrow ? <div className="label-caps mb-3">{eyebrow}</div> : null}
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
            {description ? <p className="mt-3 max-w-3xl text-sm text-slate-400 sm:text-base">{description}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>

        <main className="pb-6">{children}</main>
      </div>
    </div>
  )
}
