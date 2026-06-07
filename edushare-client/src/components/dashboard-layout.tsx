import { useState, useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Moon, Sun, UserCircle2, Star, Wallet, Info } from 'lucide-react'
import { useTheme } from 'next-themes'
import { RoleSidebar, type DashboardRole } from '@/components/role-sidebar'
import { Sidebar, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggler, type Resolved, type ThemeSelection } from '@/components/animate-ui/primitives/effects/theme-toggler'
import { fetchClient } from '@/utils/fetchClient'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

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
  const [profile, setProfile] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const { theme, resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    let active = true

    const loadProfile = async () => {
      try {
        const data = await fetchClient('/users/me')
        if (!active) return
        setProfile(data)
      } catch (err) {
        console.error('Failed to load profile:', err)
      }
    }

    const loadNotifications = async () => {
      try {
        const res = await fetchClient('/notifications?page=1&itemPerPage=50')
        if (!active) return
        if (res && res.status === 'success' && Array.isArray(res.list)) {
          setNotifications(res.list)
          setUnreadCount(res.list.filter((n: any) => !n.isRead).length)
        }
      } catch (err) {
        console.error('Failed to load notifications:', err)
      }
    }

    loadProfile()
    loadNotifications()

    return () => {
      active = false
    }
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetchClient(`/notifications/${id}/read`, { method: 'PATCH' })
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  const displayUserName = profile
    ? (profile.displayName || profile.username || 'User')
    : (role === 'admin' ? 'Admin' : '...')
  
  const displayUserBalance = profile && typeof profile.balance === 'number'
    ? formatCurrency(profile.balance)
    : (role === 'admin' ? '0 đ' : '...')

  return (
    <SidebarProvider>
      <Sidebar variant='inset' className='border-r border-sidebar-border'>
        <div className='flex h-full flex-col'>
          <div className=' border-sidebar-border p-4'>
            <Link to='/' className='flex items-center gap-3'>
              <img
                src='/images/logo.jpg'
                alt='EduShare logo'
                className='size-10 rounded-xl object-cover shadow-sm'
              />
              <div>
                <p className='text-sm font-semibold'>EduShare</p>
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
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type='button'
                  className='relative flex size-9 items-center justify-center rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800'
                  aria-label='Notifications'
                >
                  <Bell className='size-4' />
                  {unreadCount > 0 && (
                    <span className='absolute right-2 top-2 flex size-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900' />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align='end' className='w-80 p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-xl bg-popover text-popover-foreground'>
                <div className='flex items-center justify-between border-b px-4 py-3 bg-muted/20'>
                  <span className='text-sm font-semibold'>Thông báo</span>
                  {unreadCount > 0 && (
                    <span className='rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'>
                      {unreadCount} mới
                    </span>
                  )}
                </div>
                <ScrollArea className='h-[350px]'>
                  {notifications.length === 0 ? (
                    <div className='flex h-48 flex-col items-center justify-center text-center p-4 text-muted-foreground'>
                      <Bell className='size-8 text-slate-300 mb-2' />
                      <p className='text-sm font-medium'>Không có thông báo nào</p>
                      <p className='text-xs'>Chúng tôi sẽ hiển thị thông báo khi có hoạt động mới.</p>
                    </div>
                  ) : (
                    <div className='divide-y divide-border'>
                      {notifications.map((item) => {
                        const Icon = item.type === 'membership' ? Star : item.type === 'transaction' ? Wallet : Info
                        const iconBg = item.type === 'membership'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : item.type === 'transaction'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'

                        return (
                          <div
                            key={item._id}
                            onClick={() => !item.isRead && handleMarkAsRead(item._id)}
                            className={`flex items-start gap-3 p-4 transition-colors cursor-pointer text-left ${
                              item.isRead ? 'hover:bg-muted/50' : 'bg-sky-50/40 hover:bg-sky-50/70 dark:bg-sky-950/20 dark:hover:bg-sky-950/30'
                            }`}
                          >
                            <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                              <Icon className='size-4' />
                            </div>
                            <div className='flex-1 space-y-1'>
                              <div className='flex items-start justify-between gap-1'>
                                <p className={`text-sm leading-tight ${item.isRead ? 'font-medium' : 'font-semibold text-foreground'}`}>
                                  {item.title}
                                </p>
                                {!item.isRead && (
                                  <span className='size-1.5 shrink-0 rounded-full bg-sky-500 mt-1.5' />
                                )}
                              </div>
                              <p className='text-xs leading-normal text-muted-foreground'>
                                {item.content}
                              </p>
                              <p className='text-[10px] text-muted-foreground/60'>
                                {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  day: '2-digit',
                                  month: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
            <div className='text-right leading-tight'>
              <p className='text-sm font-medium'>{displayUserName}</p>
              <p className='text-xs text-emerald-600'>{displayUserBalance}</p>
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
