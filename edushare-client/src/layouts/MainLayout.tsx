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
                  className={`transition-colors hover:text-primary ${item.href === '/groups' ? 'font-bold text-indigo-600' : ''}`}
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
                    <DropdownMenuItem disabled className="opacity-100 py-2.5 flex-col items-start gap-1.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-lg mx-1 my-1">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs text-muted-foreground font-medium">Số dư khả dụng</span>
                        <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                          {walletBalance !== null ? new Intl.NumberFormat('vi-VN').format(walletBalance) : '...'} credit
                        </span>
                      </div>
                      <span className="text-[9px] text-muted-foreground/80 font-normal">Tỷ giá: 1.000 VND = 1.000 credit</span>
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

      <footer className="border-t border-slate-200 py-12 text-center text-sm">
        <div className="mb-6 flex justify-center space-x-6">
          <a href="#">Điều khoản dịch vụ</a>
          <a href="#">Chính sách bảo mật</a>
          <a href="#">Tuyên bố miễn trừ</a>
          <a href="#">Liên hệ</a>
        </div>

        <p>© 2026 EduShare. Tất cả các quyền được bảo lưu.</p>
      </footer>
    </div>
  );
}