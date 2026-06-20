import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

import { ArrowRight, Moon, Sun, LayoutDashboard, Wallet, CreditCard, Receipt, Eye } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggler, type Resolved, type ThemeSelection } from '@/components/animate-ui/primitives/effects/theme-toggler';
import { useAuth } from '@/contexts/AuthContext';
import { WalletService } from '@/services/wallet.service';

const NAV_ITEMS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Nhóm', href: '/groups' },
  { label: 'Tính năng', href: '#' },
  { label: 'FAQ', href: '#' },
  { label: 'Liên hệ', href: '#' },
];

export default function MainLayout() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      WalletService.getWalletInfo()
        .then((data: any) => {
          const balance = data?.data?.balance ?? data?.balance;
          if (balance !== undefined && balance !== null) {
            setWalletBalance(parseFloat(balance));
          }
        })
        .catch(console.error);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/images/logo.jpg"
              alt="EduShare logo"
              className="h-11 w-11 rounded-2xl object-cover shadow-sm"
            />

            <div className="leading-tight">
              <div className="text-lg font-bold tracking-tight">EduShare</div>
              <div className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Dùng chung thông minh
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
            {NAV_ITEMS.map((item) => {
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className="transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggler
              theme={theme as ThemeSelection}
              resolvedTheme={(resolvedTheme ?? 'light') as Resolved}
              setTheme={setTheme}
              direction='btt'
            >
              {({ effective, toggleTheme }) => {
                const nextTheme = effective === 'dark' ? 'light' : 'dark'

                return (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        onClick={() => toggleTheme(nextTheme)}
                        className='relative flex size-9 items-center justify-center rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        aria-label='Toggle theme'
                      >
                        {effective === 'dark' ? <Moon className='size-4' /> : <Sun className='size-4' />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {effective === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
                    </TooltipContent>
                  </Tooltip>
                )
              }}
            </ThemeToggler>

            {isAuthenticated ? (
              <>
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <button
                          type='button'
                          className='relative flex size-9 items-center justify-center rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none'
                        >
                          <Wallet className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      Ví EduShare
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-lg">
                    <DropdownMenuLabel className="text-base font-semibold">Ví EduShare</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2">
                        <Link to="/topup">
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span>Nạp tiền</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2">
                        <Link to="/dashboard/participant/orders">
                          <Receipt className="mr-2 h-4 w-4" />
                          <span>Giao Dịch</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2">
                        <Link to="/dashboard/participant/orders">
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Nội dung đã mở khóa</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled className="opacity-100 py-2.5 flex-col items-start gap-0.5 rounded-lg bg-primary/10 dark:bg-primary/15 cursor-default select-none">
                      <>
                        <span className="text-xs text-muted-foreground font-medium">Số dư hiện tại</span>
                        <span className="text-sm font-bold text-primary tracking-tight">
                          {walletBalance !== null ? new Intl.NumberFormat('vi-VN').format(walletBalance) : '...'} credit
                        </span>
                        <span className="text-[10px] text-muted-foreground font-normal">1.000 VND = 1.000 credit</span>
                      </>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link 
                      to={user?.role?.toLowerCase() === 'admin' ? '/admin/overview' : user?.role?.toLowerCase() === 'owner' ? '/owner/overview' : '/dashboard/overview'} 
                      className="relative flex size-9 items-center justify-center rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <LayoutDashboard className="size-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    Về Dashboard
                  </TooltipContent>
                </Tooltip>

                <Button onClick={handleLogout} variant="outline" className="rounded-full px-5">
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex">
                  <Link to="/login">Đăng nhập</Link>
                </Button>

                <Button asChild className="rounded-full px-5">
                  <Link to="/login">
                    Bắt đầu ngay
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <Outlet />

      <footer className="border-t border-border/50 bg-background text-foreground py-16 px-4 sm:px-6 lg:px-8 mt-24">
        <div className="mx-auto max-w-7xl grid gap-10 md:grid-cols-2 lg:grid-cols-5 text-left">
          
          {/* Logo & Slogan Column */}
          <div className="space-y-4 lg:col-span-1">
            <h3 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
              EduShare<span className="text-emerald-500">.</span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dùng chung tài khoản thông minh, tiết kiệm tối đa chi phí học tập cho sinh viên.
            </p>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Công ty</h4>
            <ul className="space-y-2.5 text-sm font-medium text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Về EduShare</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Tuyển dụng</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Ứng dụng</a></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Liên hệ</h4>
            <ul className="space-y-2.5 text-sm font-medium text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Hỗ trợ / FAQ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Báo chí</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Đối tác</a></li>
            </ul>
          </div>

          {/* More Column */}
          <div className="space-y-4">
            <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Chính sách</h4>
            <ul className="space-y-2.5 text-sm font-medium text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Tuyên bố miễn trừ</a></li>
            </ul>
          </div>

          {/* Socials & Store Column */}
          <div className="space-y-6 lg:col-span-1">
                     <div className="flex items-center gap-3">
              {/* Facebook */}
              <a 
                href="https://web.facebook.com/share/1BMmpYuGMf/?mibextid=wwXIfr&_rdc=1&_rdr" 
                target="_blank"
                rel="noreferrer"
                className="flex size-10 items-center justify-center rounded-full bg-[#1877F2]/10 dark:bg-[#1877F2]/20 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all duration-300 shadow-sm"
              >
                <svg className="size-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>

              {/* TikTok */}
              <a 
                href="https://www.tiktok.com/@.cng.ngh92?_r=1&_t=ZS-97MrEQ8AKmq" 
                target="_blank"
                rel="noreferrer"
                className="flex size-10 items-center justify-center rounded-full bg-slate-950/10 dark:bg-white/10 text-slate-800 dark:text-slate-200 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 shadow-sm"
              >
                <svg className="size-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.024a.066.066 0 00-.008.006 8.22 8.22 0 00-.171 1.76c.01 1.636.711 3.197 1.956 4.256a.065.065 0 00.063.003c.536-.263 1.107-.464 1.7-.6a.066.066 0 00.053-.065V1.876a.066.066 0 00-.056-.065 5.922 5.922 0 01-3.473-1.72.067.067 0 00-.065-.067H12.525zm-2.072 0a.066.066 0 00-.066.066V15.75c0 1.83-1.485 3.314-3.316 3.314-1.83 0-3.314-1.485-3.314-3.315 0-1.83 1.484-3.315 3.314-3.315.358 0 .707.057 1.042.17a.066.066 0 00.083-.053V9.011a.066.066 0 00-.05-.064 6.84 6.84 0 00-1.075-.084C3.21 8.863.125 11.95.125 15.75c0 3.801 3.086 6.887 6.887 6.887 3.8 0 6.886-3.086 6.886-6.887V6.994c1.238 1.01 2.82 1.583 4.49 1.606a.066.066 0 00.067-.066V5.021a.066.066 0 00-.05-.064A5.926 5.926 0 0113.6 2.378a.066.066 0 00-.058-.063V.09a.066.066 0 00-.066-.066H10.453z" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        <div className="mt-16 border-t border-border/40 pt-8 text-center text-xs text-muted-foreground font-medium">
          <p>© 2026 EduShare. Tất cả các quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}