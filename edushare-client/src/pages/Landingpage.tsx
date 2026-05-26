import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  FileCheck2,
  Home,
  LayoutGrid,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const NAV_ITEMS = [
  { label: 'Trang chủ', href: '#' },
  { label: 'Danh mục', href: '#categories' },
  { label: 'Nhóm đang chờ ghép', href: '#groups' },
  { label: 'Bảo vệ', href: '#trust' },
  { label: 'FAQ', href: '#faq' },
]

const CATEGORIES = [
  { name: 'Cursor', count: '08 nhóm', accent: 'bg-slate-950 text-white' },
  { name: 'Codex', count: '06 nhóm', accent: 'bg-indigo-50 text-indigo-700' },
  { name: 'Chat GPT', count: '02 nhóm', accent: 'bg-emerald-50 text-emerald-700' },
  { name: 'Canva', count: '00 nhóm', accent: 'bg-sky-50 text-sky-700' },
  { name: 'VPS giá rẻ', count: '08 nhóm', accent: 'bg-violet-50 text-violet-700' },
  { name: 'Kiro', count: '00 nhóm', accent: 'bg-orange-50 text-orange-700' },
  { name: 'Kling', count: '02 nhóm', accent: 'bg-rose-50 text-rose-700' },
  { name: 'Suno', count: '02 nhóm', accent: 'bg-amber-50 text-amber-700' },
  { name: 'Youtube', count: '01 nhóm', accent: 'bg-red-50 text-red-700' },
  { name: 'Khác', count: '02 nhóm', accent: 'bg-slate-100 text-slate-700' },
]

const FEATURE_CARDS = [
  { title: 'Giá rõ trước khi tham gia', desc: 'Mỗi nhóm đều hiển thị giá, thời hạn, slot còn trống và trạng thái rõ ràng.' },
  { title: 'Thanh toán an toàn', desc: 'Escrow giữ tiền đến khi giao dịch hoàn tất và có xác nhận hợp lệ.' },
  { title: 'Tra cứu lịch sử', desc: 'Người dùng xem lại đơn, trạng thái thanh toán và các yêu cầu hỗ trợ.' },
  { title: 'Hỗ trợ nhanh', desc: 'Trường hợp có vấn đề sẽ được theo dõi theo đơn và xử lý đúng quy trình.' },
]

const GROUPS = [
  { name: 'Cursor Pro 6000 request - 30 ngày', tag: 'Hết hàng', category: 'Cursor', rating: 4.9, price: '180.000 đ', description: 'Gói Cursor Pro 30 ngày, có 6000 request trong 30 ngày, phù hợp nhóm học tập và làm việc cần request lớn.' },
  { name: 'Cursor Pro 1200 request - 7 ngày', tag: 'Hết hàng', category: 'Cursor', rating: 4.9, price: '250.000 đ', description: 'Gói Cursor Pro 7 ngày, có 1200 request trong 7 ngày. Cân bằng giữa giá và hiệu năng.' },
  { name: 'Cursor Pro 200 request/ngày - 30 ngày', tag: 'Sắp hết hàng', category: 'Cursor', rating: 4.9, price: '370.000 đ', description: 'Gói Cursor Pro 30 ngày, mỗi ngày 200 request. Phù hợp người dùng thường xuyên.' },
  { name: 'Cursor Pro 200 request/ngày - 7 ngày', tag: 'Hết hàng', category: 'Cursor', rating: 4.9, price: '499.000 đ', description: 'Gói Cursor Pro 7 ngày, mỗi ngày 200 request. Phù hợp dùng ngắn hạn, dễ mua nhanh.' },
]

const BENEFITS = [
  'Thanh toán an toàn',
  'Giao hàng tức thì',
  'Hỗ trợ 24/7',
  'Thanh toán VietQR',
]

const SUPPORT_ITEMS = [
  'Thông tin email hoặc dữ liệu cần thiết được lưu cùng đơn.',
  'Mã đơn, số tiền và trạng thái thanh toán được ghi nhận rõ.',
  'Yêu cầu gia hạn hoặc hỗ trợ lại được theo dõi trong cùng đơn.',
]

const TRUST_ITEMS = [
  { icon: ShieldCheck, text: 'Escrow giữ tiền an toàn' },
  { icon: BadgeCheck, text: 'Trust Score rõ ràng' },
  { icon: Bell, text: 'Thông báo tự động' },
  { icon: Clock3, text: 'Xử lý tranh chấp nhanh' },
]

const FAQS = [
  { question: 'Tôi có được hoàn tiền không?', answer: 'Có, nếu giao dịch thất bại hoặc có tranh chấp được xác minh, hệ thống sẽ hoàn tiền theo kết quả xử lý.' },
  { question: 'Membership hết hạn thì sao?', answer: 'Khi membership hết hạn, quyền tham gia nhóm sẽ tạm khóa cho đến khi bạn gia hạn lại.' },
  { question: 'Có phí ẩn không?', answer: 'Không. EduShare hiển thị rõ phí membership và các khoản liên quan trước khi bạn xác nhận.' },
  { question: 'Tôi cần chuẩn bị gì khi hỗ trợ?', answer: 'Chỉ cần mô tả giao dịch và cung cấp minh chứng như ảnh chụp màn hình hoặc thông tin thanh toán.' },
]

export default function LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0)
  const categories = useMemo(() => CATEGORIES, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-lg font-bold tracking-tight">EduShare</div>
              <div className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">Dùng chung thông minh</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
            {NAV_ITEMS.map((item) => (
              <a key={item.label} href={item.href} className="transition-colors hover:text-primary">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex">
              <Link to="/login">Đăng nhập</Link>
            </Button>
            <Button asChild className="rounded-full px-5">
              <Link to="/login">
                Bắt đầu ngay <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="overflow-hidden rounded-[2rem] border-border/60 bg-gradient-to-br from-muted/70 via-background to-primary/5 shadow-sm">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <Badge variant="secondary" className="rounded-full px-4 py-1 text-sm font-medium">
                <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-emerald-500" /> Gói số tiện dùng mỗi ngày
              </Badge>
              <h1 className="mt-6 max-w-xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Mua tài khoản số
                <span className="block text-primary">nhanh gọn, rõ ràng</span>
                <span className="block">bắt đầu ngay</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                EduShare giúp sinh viên ghép nhóm các gói Canva, Microsoft 365, Adobe, AI tools... với escrow,
                Trust Score và quản lý thành viên tự động để giảm scam, giảm thao tác thủ công.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full px-7">
                  <a href="#groups">
                    Xem sản phẩm <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-7">
                  <a href="#categories">Xem danh mục</a>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {BENEFITS.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card className="overflow-hidden rounded-[2rem] border-border/60 bg-slate-950 text-white shadow-sm dark:bg-slate-950">
              <CardContent className="grid gap-6 p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Nhóm đang chờ ghép</p>
                    <h2 className="text-2xl font-bold">Rõ ràng, dễ theo dõi</h2>
                  </div>
                  <Badge className="rounded-full bg-white/10 text-white hover:bg-white/10">EduShare</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <Search className="h-5 w-5 text-cyan-300" />
                    <p className="mt-4 text-sm font-semibold">Tìm nhóm nhanh</p>
                    <p className="mt-1 text-sm text-white/70">Lọc theo phần mềm, giá và Trust Score.</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <CreditCard className="h-5 w-5 text-violet-300" />
                    <p className="mt-4 text-sm font-semibold">Escrow bảo vệ</p>
                    <p className="mt-1 text-sm text-white/70">Tiền chỉ giải ngân khi giao dịch được xác nhận.</p>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm text-white/80">
                    <span>Trust Score trung bình</span>
                    <span>4.8/5</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className="h-2 w-[88%] rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="rounded-[1.75rem] border-border/60 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Nhóm phổ biến</p>
                  <div className="mt-2 text-3xl font-bold">08 danh mục</div>
                  <p className="mt-2 text-sm text-muted-foreground">Các nhóm đang chờ ghép được cập nhật theo nhu cầu thực tế.</p>
                </CardContent>
              </Card>
              <Card className="rounded-[1.75rem] border-border/60 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Xử lý tranh chấp</p>
                  <div className="mt-2 text-3xl font-bold">&lt; 2h</div>
                  <p className="mt-2 text-sm text-muted-foreground">Hỗ trợ xử lý minh chứng và phản hồi nhanh.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="categories" className="mt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Danh mục</h2>
              <p className="mt-2 text-muted-foreground">Bố cục card giống ảnh mẫu nhưng nội dung vẫn là của EduShare.</p>
            </div>
            <Button variant="ghost" className="rounded-full">
              Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {categories.map((item) => (
              <Card key={item.name} className="rounded-[1.5rem] border-border/60 shadow-sm transition-transform hover:-translate-y-0.5">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-bold ${item.accent}`}>{item.name.slice(0, 1)}</div>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.count}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="groups" className="mt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Cursor</h2>
              <p className="mt-2 text-muted-foreground">Các nhóm đang chờ ghép, giá rõ ràng, slot minh bạch.</p>
            </div>
            <Button variant="ghost" className="rounded-full">
              Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {GROUPS.map((group) => (
              <Card key={group.name} className="rounded-[1.75rem] border-border/60 shadow-sm">
                <CardContent className="p-4">
                  <div className="aspect-[1/1] rounded-[1.5rem] bg-slate-950 p-4 text-white">
                    <div className="flex items-start justify-between">
                      <Badge variant={group.tag === 'Còn slot' ? 'default' : 'secondary'} className="rounded-full">
                        {group.tag}
                      </Badge>
                      <Badge className="rounded-full bg-white/10 text-white hover:bg-white/10">{group.category}</Badge>
                    </div>
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 text-4xl font-black">E</div>
                        <p className="text-sm text-white/70">Nhóm EduShare</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {group.rating}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold leading-7">{group.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{group.description}</p>
                    <div className="mt-4 border-t border-border pt-4">
                      <div className="text-lg font-bold">{group.price}</div>
                      <Button className="mt-4 w-full rounded-full bg-slate-900 text-white hover:bg-slate-800">
                        <CreditCard className="mr-2 h-4 w-4" /> Thêm vào giỏ
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="rounded-[2rem] border-border/60 shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Mua nhanh, biết rõ mình nhận gì</h2>
                  <p className="mt-2 max-w-2xl text-muted-foreground">EduShare tập trung các nhóm thuê bao thường dùng, giá rõ ràng, dễ theo dõi và hỗ trợ nhanh.</p>
                </div>
                <Button className="rounded-full">Xem gian hàng</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {FEATURE_CARDS.map((item) => (
                  <Card key={item.title} className="rounded-[1.5rem] border-border/60 shadow-none">
                    <CardContent className="p-5">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-border/60 shadow-sm">
            <CardHeader>
              <Badge variant="secondary" className="w-fit rounded-full">
                Kênh hỗ trợ
              </Badge>
              <CardTitle className="text-2xl">Đúng quy trình cho từng nhóm</CardTitle>
              <CardDescription>
                Nhóm có sẵn giao ngay sau khi thanh toán được ghi nhận. Nhóm cần thao tác riêng sẽ được chuyển cho đội hỗ trợ.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[1.5rem] border border-border bg-primary/5 p-4 text-sm">Giao nhanh khi có sẵn</div>
              <div className="rounded-[1.5rem] border border-border bg-primary/5 p-4 text-sm">Theo đơn khi cần</div>
              <div className="rounded-[1.5rem] border border-border bg-primary/5 p-4 text-sm">Tra lại lịch sử</div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-16">
          <Card className="rounded-[2rem] border-border/60 shadow-sm">
            <CardHeader>
              <Badge variant="secondary" className="w-fit rounded-full">
                Mua nhanh, biết rõ
              </Badge>
              <CardTitle className="text-3xl">Cần hỗ trợ? Có người theo đơn</CardTitle>
              <CardDescription>
                Với gói cần email hoặc thao tác thủ công, thông tin bạn nhập được ghi nhận đầy đủ để đội hỗ trợ tiếp nhận đúng việc.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {SUPPORT_ITEMS.map((item) => (
                <div key={item} className="rounded-[1.5rem] border border-border p-5 text-sm leading-6 text-muted-foreground">
                  <CheckCircle2 className="mb-3 h-5 w-5 text-primary" />
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section id="trust" className="mt-16 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-[2rem] border-border/60 bg-primary text-primary-foreground shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <Badge className="rounded-full bg-white/15 text-white hover:bg-white/15">Cơ chế bảo vệ</Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">Bảo vệ giao dịch, người dùng và uy tín cộng đồng</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/85">
                EduShare được xây dựng để hạn chế scam, giảm thao tác thủ công và hỗ trợ xử lý tranh chấp minh bạch.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {TRUST_ITEMS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 rounded-[1.25rem] bg-white/10 px-4 py-3">
                    <Icon className="h-5 w-5 text-white" />
                    <span className="text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-border/60 shadow-sm">
            <CardHeader>
              <Badge variant="secondary" className="w-fit rounded-full">
                Cảm nhận
              </Badge>
              <CardTitle className="text-2xl">Người dùng nói gì?</CardTitle>
              <CardDescription>Dành cho sinh viên và chủ nhóm sử dụng thường xuyên.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Minh Anh', role: 'Sinh viên năm 3', text: 'Mình thấy hệ thống rõ ràng, xem Trust Score nhanh và cảm giác an tâm hơn khi tham gia nhóm.' },
                { name: 'Hồng Nhung', role: 'Chủ nhóm Canva', text: 'Quản lý slot và xác nhận thành viên gọn hơn nhiều so với nhắn tin thủ công.' },
                { name: 'Tuấn Khải', role: 'Người dùng thường xuyên', text: 'Escrow giúp mình yên tâm hơn, nhất là khi tham gia nhóm phần mềm có giá trị cao.' },
              ].map((item) => (
                <div key={item.name} className="rounded-[1.5rem] border border-border p-5">
                  <div className="mb-3 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">“{item.text}”</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section id="faq" className="mt-16 pb-24">
          <Card className="rounded-[2rem] border-border/60 shadow-sm">
            <CardHeader className="text-center">
              <Badge variant="secondary" className="mx-auto w-fit rounded-full">
                Câu hỏi thường gặp
              </Badge>
              <CardTitle className="text-3xl">Câu hỏi thường gặp</CardTitle>
              <CardDescription>Tìm câu trả lời nhanh cho những thắc mắc phổ biến nhất về EduShare.</CardDescription>
            </CardHeader>
            <CardContent className="mx-auto max-w-4xl">
              <div className="space-y-4">
                {FAQS.map((item, index) => {
                  const isOpen = openFaqIndex === index
                  return (
                    <div key={item.question} className="rounded-[1.25rem] border border-border">
                      <button type="button" onClick={() => setOpenFaqIndex(isOpen ? -1 : index)} className="flex w-full items-center justify-between px-5 py-4 text-left">
                        <span className="font-medium">{item.question}</span>
                        <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen ? <div className="border-t border-border px-5 py-4 text-sm leading-6 text-muted-foreground">{item.answer}</div> : null}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="pb-16">
          <Card className="rounded-[2rem] border-border/60 bg-gradient-to-r from-primary to-sky-500 text-white shadow-sm">
            <CardContent className="p-8 text-center sm:p-10">
              <h2 className="text-3xl font-bold tracking-tight">Sẵn sàng thử cách ghép nhóm an toàn hơn?</h2>
              <p className="mx-auto mt-4 max-w-2xl text-white/85">
                Tham gia EduShare để tìm nhóm phù hợp, bảo vệ giao dịch bằng escrow và quản lý mọi thứ gọn gàng hơn.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" variant="secondary" className="rounded-full px-7 text-slate-950">
                  <Link to="/login">Bắt đầu miễn phí</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 bg-white/10 px-7 text-white hover:bg-white/20 hover:text-white">
                  <a href="#groups">Xem nhóm đang chờ ghép</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
