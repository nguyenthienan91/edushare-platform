import { Outlet, Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { label: 'Trang chủ', href: '#' },
  { label: 'Tính năng', href: '#' },
  { label: 'FAQ', href: '#' },
  { label: 'Liên hệ', href: '#' },
];

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background">

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="leading-tight">
              <div className="text-lg font-bold tracking-tight">
                EduShare
              </div>

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
            <Button
              asChild
              variant="ghost"
              className="hidden rounded-full sm:inline-flex"
            >
              <Link to="/login">Đăng nhập</Link>
            </Button>

            <Button asChild className="rounded-full px-5">
              <Link to="/login">
                Bắt đầu ngay
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

        </div>
      </header>

      {/* Page render */}
      <Outlet />

      {/* Footer */}
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