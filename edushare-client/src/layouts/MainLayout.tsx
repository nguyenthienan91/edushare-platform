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

            {isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full bg-background hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:ring-0">
                      <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                  </DropdownMenuTrigger>
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
                    <DropdownMenuItem disabled className="opacity-100 font-medium text-slate-500 py-2 flex-col items-start gap-1">
                      {user?.role?.toLowerCase() === 'admin' ? (
                        <span>Số dư: {walletBalance !== null ? new Intl.NumberFormat('vi-VN').format(walletBalance) : '...'} đ</span>
                      ) : (
                        <>
                          <span>Số dư: {walletBalance !== null ? new Intl.NumberFormat('vi-VN').format(walletBalance) : '...'} credit</span>
                          <span className="text-[10px] text-muted-foreground font-normal">1đ = 1 credit</span>
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button asChild variant="outline" size="icon" className="rounded-full bg-background hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <Link 
                    to={user?.role?.toLowerCase() === 'admin' ? '/admin/overview' : user?.role?.toLowerCase() === 'owner' ? '/owner/overview' : '/dashboard/overview'} 
                    title="Về Dashboard"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                  </Link>
                </Button>
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

        <p>© 2026 Share Hub. Tất cả các quyền được bảo lưu.</p>
      </footer>
    </div>
  );
}