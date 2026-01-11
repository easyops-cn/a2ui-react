import type { ReactNode } from 'react'

interface HeaderProps {
  title: string
  children?: ReactNode
}

export function Header({ title, children }: HeaderProps) {
  return (
    <header className="app-header">
      <h1 className="app-title">{title}</h1>
      <div className="app-header-actions">{children}</div>
    </header>
  )
}
