import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-left">
            <span className="text-xl font-bold text-slate-900 tracking-tight block leading-tight">Share Hub</span>
            <span className="text-xs text-emerald-600 font-medium">Chia sẻ thông minh hơn</span>
          </div>
        </Link>
        <div className="space-x-4">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Log in</Link>
          <Link to="/login" className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-full transition-colors">Get Started</Link>
        </div>
      </nav>

      {/* Page sẽ render ở đây */}
      <Outlet />

       {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 text-center text-sm text-slate-500">
        <div className="flex justify-center space-x-6 mb-6">
          <a href="#" className="hover:text-slate-900 transition-colors">Điều khoản dịch vụ</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Chính sách bảo mật</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Tuyên bố miễn trừ</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Liên hệ</a>
        </div>
        <p>© 2026 Share Hub. Tất cả các quyền được bảo lưu.</p>
      </footer>

    </div>
  );
}