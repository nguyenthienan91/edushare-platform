import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Moon, Sparkles, Sun, UserCircle2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { RoleSidebar, type DashboardRole } from '@/components/role-sidebar'
import { Sidebar, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggler, type Resolved, type ThemeSelection } from '@/components/animate-ui/primitives/effects/theme-toggler'

export function DashboardLayout({
  role,
  title,
  description,
  children
}: {
  role: DashboardRole
  title: string
  description: string
  children: ReactNode
}) {
  const userName = role === 'admin' ? 'Admin' : role === 'owner' ? 'John Doe' : 'Member'
  const userBalance = role === 'admin' ? '$0.00' : role === 'owner' ? '$120.50' : '$45.20'
  const { theme, resolvedTheme, setTheme } = useTheme()

  return (
    <SidebarProvider>
      <Sidebar variant='inset' className='border-r border-sidebar-border'>
        <div className='flex h-full flex-col'>
          <div className=' border-sidebar-border p-4'>
            <Link to='/' className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-xl bg-emerald-500 text-white'>
                <Sparkles className='size-5' />
              </div>
              <div>
                <p className='text-sm font-semibold'>Share Hub</p>
                <p className='text-xs text-sidebar-foreground/70'>Chia sẻ thông minh</p>
              </div>
            </Link>
          </div>
          <div className='flex-1 overflow-auto'>
            <RoleSidebar role={role} />
          </div>
        </div>
      </Sidebar>
      <SidebarInset>
        <header className='flex items-center justify-between gap-4 border-b bg-background px-6 py-4'>
          <div className='flex items-center gap-4'>
            <SidebarTrigger />
            <div>
              <h1 className='text-base font-semibold '>{title}</h1>
              <p className='text-sm '>{description}</p>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <ThemeToggler
              theme={theme as ThemeSelection}
              resolvedTheme={(resolvedTheme ?? 'light') as Resolved}
              setTheme={setTheme}
              direction='btt'
            >
              {({ effective, toggleTheme }) => {
                const nextTheme = effective === 'dark' ? 'light' : 'dark'

                return (
                  <button
                    type='button'
                    onClick={() => toggleTheme(nextTheme)}
                    className='relative flex size-9 items-center justify-center rounded-full transition-colors'
                    aria-label='Toggle theme'
                  >
                    {effective === 'dark' ? <Moon className='size-4' /> : <Sun className='size-4' />}
                  </button>
                )
              }}
            </ThemeToggler>
            <button
              type='button'
              className='relative flex size-9 items-center justify-center rounded-full transition-colors '
              aria-label='Notifications'
            >
              <Bell className='size-4' />
              <span className='absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white' />
            </button>
            <div className='text-right leading-tight'>
              <p className='text-sm font-medium'>{userName}</p>
              <p className='text-xs text-emerald-600'>{userBalance}</p>
            </div>
            <button
              type='button'
              className='flex size-9 items-center justify-center rounded-full bg-emerald-500 text-white'
              aria-label='User profile'
            >
              <UserCircle2 className='size-4' />
            </button>
          </div>
        </header>
        <main className='flex-1  p-6'>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
