import { Link } from 'react-router';
import { Sparkles, CheckCircle2, Lock, Scale, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
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
          <Button variant="outline">Button</Button>
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Log in</Link>
          <Link to="/login" className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-full transition-colors">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-6 py-24 md:py-32 text-center max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight"
        >
          Chia sẻ thông minh hơn. <br className="hidden md:block"/> Tiết kiệm an toàn hơn.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-xl text-slate-600"
        >
          Nền tảng chia sẻ nhóm đáng tin cậy cho các đăng ký kỹ thuật số với hệ thống bảo vệ ký quỹ và đánh giá.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <Link to="/login" className="px-8 py-3.5 w-full sm:w-auto text-base font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-full transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2">
            Tham gia ngay <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/login" className="px-8 py-3.5 w-full sm:w-auto text-base font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-full transition-all">
            Liệt kê đăng ký của bạn
          </Link>
        </motion.div>
      </header>

      {/* Problem & Solution */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Tại sao lại cần Share Hub?</h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Chia sẻ tài khoản thường đi kèm với rủi ro. Chúng tôi đã xây dựng một nền tảng để loại bỏ những rủi ro đó.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-600 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Không bảo vệ</h3>
              <p className="text-slate-600 text-sm">Rủi ro mất tiền hoặc mất quyền truy cập vào tài khoản khi chia sẻ với người lạ.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="text-orange-600 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Thanh toán Ký quỹ</h3>
              <p className="text-slate-600 text-sm">Tiền của bạn được giữ an toàn cho đến khi bạn xác nhận có quyền truy cập đăng ký.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Scale className="text-emerald-600 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Giải quyết tranh chấp</h3>
              <p className="text-slate-600 text-sm">Đội ngũ quản trị luôn sẵn sàng phân xử công bằng mọi vấn đề giữa các bên.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Cách thức hoạt động</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Đăng ký tài khoản', desc: 'Tạo hồ sơ và chọn vai trò của bạn.' },
              { step: 2, title: 'Liệt kê / Tham gia', desc: 'Đăng gói hoặc tìm gói phù hợp.' },
              { step: 3, title: 'Thanh toán an toàn', desc: 'Tiền được giữ trong tài khoản ký quỹ.' },
              { step: 4, title: 'Cấp quyền', desc: 'Chủ sở hữu gửi thông tin đăng nhập.' },
              { step: 5, title: 'Xác nhận', desc: 'Người dùng xác nhận truy cập thành công.' },
              { step: 6, title: 'Giải phóng tiền', desc: 'Chủ sở hữu nhận được thanh toán.' },
              { step: 7, title: 'Đánh giá', desc: 'Xây dựng uy tín qua hệ thống sao.' },
              { step: 8, title: 'Hỗ trợ', desc: 'Xử lý mọi vấn đề phát sinh.' }
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 bg-emerald-500 text-slate-900 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
