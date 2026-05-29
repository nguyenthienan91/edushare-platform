import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { ThemeToggler, type Resolved, type ThemeSelection } from '@/components/animate-ui/primitives/effects/theme-toggler';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { label: 'Trang chủ', href: '#' },
  { label: 'Tính năng', href: '#' },
  { label: 'FAQ', href: '#' },
  { label: 'Liên hệ', href: '#' },
];

export default function MainLayout() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ))}
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
              <Button onClick={handleLogout} variant="outline" className="rounded-full px-5">
                Đăng xuất
              </Button>
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