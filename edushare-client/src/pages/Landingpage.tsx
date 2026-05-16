import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileCheck2,
  LayoutGrid,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
} from 'lucide-react';

const PLATFORMS = [
  { name: 'Canva', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { name: 'Microsoft 365', color: 'bg-sky-50 text-sky-600 border-sky-100' },
  { name: 'Adobe', color: 'bg-orange-50 text-orange-600 border-orange-100' },
  { name: 'Notion', color: 'bg-violet-50 text-violet-600 border-violet-100' },
];

const STATS = [
  { value: '12,000+', label: 'Sinh viên tin dùng' },
  { value: '50,000+', label: 'Giao dịch được bảo vệ' },
  { value: '99.2%', label: 'Tỷ lệ hài lòng' },
  { value: '< 2h', label: 'Xử lý tranh chấp trung bình' },
];

const FEATURES = [
  { icon: ShieldCheck, title: 'Escrow bảo vệ giao dịch', desc: 'Tiền được giữ an toàn trong 24h–48h cho đến khi các bên xác nhận giao dịch hoàn tất.', accent: 'from-indigo-500 to-sky-500', bg: 'bg-indigo-50' },
  { icon: Search, title: 'Tìm nhóm dễ dàng', desc: 'Duyệt nhóm theo phần mềm, category, giá và Trust Score để chọn đúng nhóm phù hợp.', accent: 'from-sky-500 to-cyan-500', bg: 'bg-sky-50' },
  { icon: BadgeCheck, title: 'Trust Score minh bạch', desc: 'Xem lịch sử, đánh giá và uy tín của chủ nhóm trước khi tham gia để giảm rủi ro scam.', accent: 'from-orange-400 to-amber-500', bg: 'bg-orange-50' },
  { icon: Bell, title: 'Tự động nhắc việc', desc: 'Thông báo về thanh toán, gia hạn, thành viên mới và trạng thái giao dịch được gửi tự động.', accent: 'from-violet-500 to-indigo-500', bg: 'bg-violet-50' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Đăng ký thành viên', desc: 'Sinh viên tạo tài khoản và gia hạn membership 29k/tháng để mở quyền tham gia.', icon: Users },
  { step: '02', title: 'Khám phá nhóm phù hợp', desc: 'Tìm nhóm theo phần mềm, xem thông tin slot, giá và mức độ uy tín của chủ nhóm.', icon: LayoutGrid },
  { step: '03', title: 'Thanh toán vào escrow', desc: 'Tiền được hệ thống giữ trung gian để bảo vệ người tham gia trước rủi ro lừa đảo.', icon: Wallet },
  { step: '04', title: 'Xác nhận và giải ngân', desc: 'Upload minh chứng, xác nhận đã được thêm vào nhóm, sau đó hệ thống giải ngân tự động.', icon: CheckCircle2 },
];

const WORKFLOW_ITEMS = [
  'Quản lý slot còn trống và trạng thái nhóm',
  'Upload minh chứng giao dịch cho admin xử lý',
  'Tạo khiếu nại nếu giao dịch thất bại',
  'Theo dõi ví, lịch sử và yêu cầu rút tiền',
];

const DISCOVERY_GROUPS = [
  {
    title: 'Canva Pro Shared',
    category: 'Design',
    price: '49k',
    trust: 4.9,
    slots: '2 slot trống',
    summary: 'Dành cho sinh viên thiết kế cần không gian làm việc ổn định và an toàn.',
  },
  {
    title: 'Microsoft 365 Study Pack',
    category: 'Productivity',
    price: '39k',
    trust: 4.8,
    slots: '1 slot trống',
    summary: 'Phù hợp nhóm học tập, làm bài và cộng tác tài liệu mỗi ngày.',
  },
  {
    title: 'ChatGPT Plus Group',
    category: 'AI Tools',
    price: '69k',
    trust: 4.9,
    slots: '3 slot trống',
    summary: 'Khám phá công cụ AI cho học tập, nghiên cứu và sáng tạo nội dung.',
  },
];

const TESTIMONIALS = [
  { name: 'Minh Anh', role: 'Sinh viên năm 3', text: 'Mình thích vì hệ thống rất rõ ràng, dễ xem Trust Score và cảm giác an tâm hơn hẳn khi tham gia nhóm.', rating: 5 },
  { name: 'Hồng Nhung', role: 'Chủ nhóm Canva', text: 'Việc quản lý slot và xác nhận thành viên đơn giản hơn nhiều so với nhắn tin thủ công trên Facebook.', rating: 5 },
  { name: 'Tuấn Khải', role: 'Người dùng thường xuyên', text: 'Escrow giúp mình yên tâm hơn, đặc biệt là khi tham gia các nhóm phần mềm học tập có giá trị cao.', rating: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-indigo-50/50 text-slate-900 overflow-x-hidden">
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 shadow-lg shadow-indigo-200 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="block text-base font-bold tracking-tight text-slate-900">EduShare</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-600">Dùng chung thông minh</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Gói membership</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Tính năng</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">Cách hoạt động</a>
            <a href="#trust" className="hover:text-slate-900 transition-colors">Bảo vệ</a>
            <a href="#testimonials" className="hover:text-slate-900 transition-colors">Cảm nhận</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline-flex rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Đăng nhập</Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5 hover:bg-slate-800">Bắt đầu ngay <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:pt-36">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-indigo-100 blur-3xl" />
          <div className="absolute right-[-6rem] top-36 h-72 w-72 rounded-full bg-sky-100 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-orange-100/70 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm"><span className="h-2 w-2 rounded-full bg-orange-400" />Nền tảng dành cho sinh viên tìm và quản lý thuê bao dùng chung</motion.div>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">Chia sẻ thuê bao<span className="block bg-gradient-to-r from-indigo-600 via-sky-600 to-orange-500 bg-clip-text text-transparent">an toàn, minh bạch và tiện cho sinh viên.</span></motion.h1>
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl">EduShare giúp sinh viên ghép nhóm các gói Canva, Microsoft 365, Adobe, AI tools... thông qua cơ chế escrow, Trust Score và quản lý thành viên tự động để giảm scam và thao tác thủ công.</motion.p>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a href="#pricing" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-200 transition-all hover:-translate-y-0.5 hover:shadow-xl sm:w-auto">Xem gói 29k/tháng <ArrowRight className="h-5 w-5" /></a>
              <Link to="/login" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 sm:w-auto">Tạo tài khoản để mua</Link>
            </motion.div>
            <div className="mt-12 flex flex-wrap gap-3">
              {PLATFORMS.map((platform) => (<div key={platform.name} className={`rounded-full border px-4 py-2 text-sm font-medium ${platform.color}`}>{platform.name}</div>))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.15 }} className="relative">
            <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-orange-400" />
              <div className="mb-6 flex items-center justify-between">
                <div><p className="text-sm font-semibold text-slate-500">Bảng điều khiển cộng đồng</p><h2 className="text-2xl font-bold text-slate-900">Rõ ràng, an toàn, dễ theo dõi</h2></div>
                <div className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">Student-friendly</div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-indigo-50 p-4"><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm"><Search className="h-5 w-5" /></div><p className="text-sm font-semibold text-indigo-700">Tìm nhóm nhanh</p><p className="mt-1 text-sm text-slate-600">Lọc theo phần mềm, giá, category và Trust Score.</p></div>
                <div className="rounded-2xl bg-sky-50 p-4"><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm"><CreditCard className="h-5 w-5" /></div><p className="text-sm font-semibold text-sky-700">Escrow bảo vệ</p><p className="mt-1 text-sm text-slate-600">Tiền chỉ giải ngân khi giao dịch được xác nhận.</p></div>
              </div>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4"><div className="flex items-center justify-between text-sm text-slate-500"><span>Trust Score trung bình</span><span>4.8/5</span></div><div className="mt-2 h-2 rounded-full bg-slate-200"><div className="h-2 w-[88%] rounded-full bg-gradient-to-r from-indigo-500 to-sky-500" /></div></div>
            </div>
          </motion.div>
        </div>

        <div className="mx-auto mt-20 max-w-6xl"><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{STATS.map((stat) => (<motion.div key={stat.label} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm"><div className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{stat.value}</div><div className="mt-1 text-sm text-slate-500">{stat.label}</div></motion.div>))}</div></div>
      </section>

      <section id="pricing" className="px-4 py-20 sm:px-6"><div className="mx-auto max-w-6xl"><div className="mx-auto mb-14 max-w-2xl text-center"><p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Membership 29k/tháng</p><h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Xem quyền lợi miễn phí và khi mua gói</h2><p className="mt-4 text-slate-600">Sinh viên có thể xem nhóm miễn phí, nhưng chỉ thành viên mới được tham gia, dùng escrow và nhận hỗ trợ đầy đủ.</p></div><div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]"><div className="rounded-[2rem] border border-indigo-100 bg-white p-8 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Gói dành cho sinh viên</p><h3 className="mt-2 text-3xl font-extrabold text-slate-900">29,000 VND / tháng</h3></div><div className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">Mua để mở quyền</div></div><p className="mt-4 text-sm leading-relaxed text-slate-600">Nếu chưa mua gói, bạn chỉ có thể xem danh sách nhóm. Khi có membership, bạn được tham gia nhóm và sử dụng các tính năng bảo vệ giao dịch.</p><div className="mt-6 space-y-3">{FEATURES.map((feature) => { const Icon = feature.icon; return (<div key={feature.title} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3"><div className={`rounded-2xl bg-gradient-to-br ${feature.accent} p-2 text-white`}><Icon className="h-4 w-4" /></div><div><div className="font-semibold text-slate-900">{feature.title}</div><p className="mt-1 text-sm text-slate-600">{feature.desc}</p></div></div>); })}</div><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 px-6 py-3.5 font-semibold text-white">Tạo tài khoản để mua <ArrowRight className="h-5 w-5" /></Link><Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 hover:bg-slate-50">Đăng nhập</Link></div></div><div className="grid gap-6 sm:grid-cols-2">{[{ title: 'Không mua gói', items: ['Chỉ xem nhóm', 'Không tham gia được', 'Không dùng escrow', 'Không có dispute support'] }, { title: 'Có membership', items: ['Tham gia nhóm', 'Escrow bảo vệ', 'Trust score & cộng đồng', 'Ưu tiên hỗ trợ'] }].map((card) => (<div key={card.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><h4 className="text-lg font-bold text-slate-900">{card.title}</h4><div className="mt-4 space-y-3">{card.items.map((item) => (<div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><CheckCircle2 className="h-4 w-4 text-indigo-600" />{item}</div>))}</div></div>))}</div></div></div></section>

      <section id="how-it-works" className="px-4 py-20 sm:px-6"><div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white px-6 py-14 shadow-sm sm:px-10"><div className="mx-auto mb-14 max-w-2xl text-center"><p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Cách hoạt động</p><h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Quy trình 4 bước gọn gàng cho sinh viên</h2><p className="mt-4 text-slate-600">Từ đăng ký membership đến giải ngân, mọi thứ đều được tự động hóa và minh bạch.</p></div><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">{HOW_IT_WORKS.map((item) => { const Icon = item.icon; return (<div key={item.step} className="rounded-3xl bg-slate-50 p-6"><div className="mb-4 flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm"><Icon className="h-5 w-5" /></div><span className="text-sm font-bold text-slate-400">{item.step}</span></div><h3 className="text-lg font-bold text-slate-900">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p></div>); })}</div><div className="mt-8 grid gap-3 text-sm text-slate-600 md:grid-cols-2">{WORKFLOW_ITEMS.map((item) => (<div key={item} className="flex items-center gap-3 rounded-2xl bg-indigo-50/50 px-4 py-3"><FileCheck2 className="h-4 w-4 text-indigo-600" /><span>{item}</span></div>))}</div></div></section>

      <section id="discovery" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Discovery / Search module</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Khám phá nhóm trước, mua membership sau</h2>
            <p className="mt-4 text-slate-600">Người dùng có thể search theo tên phần mềm, filter theo category, sort theo giá hoặc Trust Score và xem slot còn trống.</p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">Search software name: Canva, Microsoft 365, Adobe, ChatGPT...</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">Filter: Design / Productivity / AI Tools</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">Sort: Price / Trust Score</div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {DISCOVERY_GROUPS.map((group) => (
                <div key={group.title} className="rounded-3xl bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-sky-600">{group.category}</p>
                      <h3 className="mt-1 text-lg font-bold text-slate-900">{group.title}</h3>
                    </div>
                    <div className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">{group.price}</div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{group.summary}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                    <span>Trust Score: {group.trust}</span>
                    <span>{group.slots}</span>
                  </div>
                  <div className="mt-5 flex gap-3">
                    <a href="#pricing" className="inline-flex flex-1 items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100">View plan</a>
                    <Link to="/login" className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white">Join now</Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-slate-700">
              Guests can explore groups and compare options. To actually join a group, the user must create an account and log in first.
            </div>
          </div>
        </div>
      </section>

      <section id="trust" className="px-4 py-20 sm:px-6"><div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]"><div className="rounded-[2rem] bg-gradient-to-br from-indigo-600 to-sky-500 p-8 text-white shadow-lg shadow-sky-100 sm:p-10"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-100">Cơ chế bảo vệ</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Bảo vệ giao dịch, người dùng và uy tín cộng đồng</h2><p className="mt-4 max-w-xl leading-relaxed text-white/90">EduShare được xây dựng để hạn chế scam, giảm thao tác thủ công và hỗ trợ xử lý tranh chấp minh bạch.</p><div className="mt-8 grid gap-4 sm:grid-cols-2">{[{ icon: ShieldCheck, text: 'Escrow giữ tiền an toàn' }, { icon: BadgeCheck, text: 'Trust Score rõ ràng' }, { icon: Bell, text: 'Thông báo tự động' }, { icon: Clock3, text: 'Xử lý tranh chấp nhanh' }].map(({ icon: Icon, text }) => (<div key={text} className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3"><Icon className="h-5 w-5 text-orange-200" /><span className="text-sm font-medium">{text}</span></div>))}</div></div><div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10" id="testimonials"><div className="mb-8 flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Cảm nhận</p><h2 className="mt-2 text-2xl font-bold text-slate-900">Người dùng nói gì?</h2></div><div className="hidden rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 sm:block">Dành cho sinh viên</div></div><div className="grid gap-5">{TESTIMONIALS.map((item) => (<div key={item.name} className="rounded-3xl bg-slate-50 p-5"><div className="mb-3 flex gap-1">{Array.from({ length: item.rating }).map((_, i) => (<Star key={i} className="h-4 w-4 fill-orange-400 text-orange-400" />))}</div><p className="text-sm leading-relaxed text-slate-700">“{item.text}”</p><div className="mt-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-sm font-bold text-white">{item.name.charAt(0)}</div><div><div className="text-sm font-semibold text-slate-900">{item.name}</div><div className="text-xs text-slate-500">{item.role}</div></div></div></div>))}</div></div></div></section>

      <section className="px-4 pb-24 pt-8 sm:px-6"><div className="mx-auto max-w-5xl rounded-[2rem] bg-gradient-to-r from-indigo-600 via-sky-500 to-orange-400 p-[1px] shadow-xl shadow-indigo-100"><div className="rounded-[2rem] bg-white px-6 py-12 text-center sm:px-10"><h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Sẵn sàng thử cách ghép nhóm an toàn hơn?</h2><p className="mx-auto mt-4 max-w-2xl text-slate-600">Tham gia EduShare để tìm nhóm phù hợp, bảo vệ giao dịch bằng escrow và quản lý mọi thứ gọn gàng hơn.</p><div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row"><Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800">Bắt đầu miễn phí <ArrowRight className="h-5 w-5" /></Link><a href="#features" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50">Xem tính năng</a></div></div></div></section>
    </div>
  );
}
