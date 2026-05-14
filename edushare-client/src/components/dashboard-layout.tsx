import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Sparkles, UserCircle2 } from 'lucide-react'
import { RoleSidebar, type DashboardRole } from '@/components/role-sidebar'
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

export function DashboardLayout({
  role,
  title,
  description,
  children,
}: {
  role: DashboardRole
  title: string
  description: string
  children: ReactNode
}) {
  const userName = role === 'admin' ? 'Admin' : 'John Doe'
  const userBalance = role === 'admin' ? '$0.00' : '$120.50'

  return (
    <SidebarProvider>
      <Sidebar variant="inset" className="border-r border-sidebar-border">
        <div className="flex h-full flex-col">
          <div className=" border-sidebar-border p-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                <Sparkles className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Share Hub</p>
                <p className="text-xs text-sidebar-foreground/70">Chia sẻ thông minh</p>
              </div>
            </Link>
          </div>
          <div className="flex-1 overflow-auto">
            <RoleSidebar role={role} />
          </div>
        </div>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between gap-4 border-b bg-background px-6 py-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-base font-semibold text-slate-900">{title}</h1>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="relative flex size-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            <div className="text-right leading-tight">
              <p className="text-sm font-medium text-slate-900">{userName}</p>
              <p className="text-xs text-emerald-600">{userBalance}</p>
            </div>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-full bg-emerald-500 text-white"
              aria-label="User profile"
            >
              <UserCircle2 className="size-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 bg-[#f0f9ff] p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
