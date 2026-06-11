import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { UserService } from '@/services/user.service'
import { GroupService } from '@/services/group.service'
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  Search,
  ShieldCheck,
  Star,
  Users,
  Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'


const MEMBERSHIP_PLAN = {
  title: 'Member / Standard User',
  price: '29.000 đ / tháng',
  desc: 'Sinh viên đã đóng phí thành viên 29k/tháng.',
  benefits: [
    'Được tham gia nhóm đang chờ ghép',
    'Dùng escrow để bảo vệ giao dịch',
    'Xem Trust Score và lịch sử rõ ràng',
    'Được hỗ trợ khi phát sinh tranh chấp',
  ],
}

const FEATURE_CARDS = [
  { title: 'Giá rõ trước khi tham gia', desc: 'Mỗi nhóm đều hiển thị giá, thời hạn, slot còn trống và trạng thái rõ ràng.' },
  { title: 'Thanh toán an toàn', desc: 'Escrow giữ tiền đến khi giao dịch hoàn tất và có xác nhận hợp lệ.' },
  { title: 'Tra cứu lịch sử', desc: 'Người dùng xem lại đơn, trạng thái thanh toán và các yêu cầu hỗ trợ.' },
  { title: 'Hỗ trợ nhanh', desc: 'Trường hợp có vấn đề sẽ được theo dõi theo đơn và xử lý đúng quy trình.' },
]



const BENEFITS = [
  { icon: ShieldCheck, text: 'Thanh toán an toàn' },
  { icon: Users, text: 'Giao hàng tức thì' },
  { icon: Bell, text: 'Hỗ trợ 24/7' },
  { icon: Wallet, text: 'Thanh toán VietQR' },
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
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [featuredGroups, setFeaturedGroups] = useState<any[]>([])
  const [isLoadingGroups, setIsLoadingGroups] = useState(true)
  
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchFeaturedGroups = async () => {
      try {
        const res: any = await GroupService.getGroups({ page: 1, itemPerPage: 3 })
        const groupsData = res?.list || res?.data || []
        setFeaturedGroups(groupsData)
      } catch (error) {
        console.error('Failed to fetch featured groups', error)
      } finally {
        setIsLoadingGroups(false)
      }
    }
    fetchFeaturedGroups()
  }, [])

  const handleUpgradeVip = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (user?.role?.toLowerCase() !== 'guest') {
      toast.info("Tài khoản của bạn", { description: "Bạn đã là thành viên (Member) hoặc ở cấp độ cao hơn." })
      return
    }

    setIsUpgrading(true)
    try {
      const res: any = await UserService.upgradeVip()
      if (res?.status === 'success' || res?.message) {
        toast.success("Nâng cấp VIP thành công!", { description: "Bây giờ bạn có thể tham gia các nhóm chia sẻ." })
        setTimeout(() => window.location.reload(), 1500)
      }
    } catch (error: any) {
      const errorMessage = error.message || "Có lỗi xảy ra, vui lòng thử lại sau."
      toast.error("Giao dịch thất bại", { description: errorMessage })
      if (errorMessage.toLowerCase().includes("balance")) {
        navigate('/topup')
      }
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

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
                {BENEFITS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" /> {text}
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

        <section id="pricing" className="mt-20">
          <div className="mb-10 text-center flex flex-col items-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Gói 29k / tháng</h2>
            <p className="mt-3 text-base text-muted-foreground max-w-2xl">
              Nâng cấp trải nghiệm EduShare với gói định kỳ, giúp bạn tham gia nhóm đang chờ ghép nhanh chóng, với chi phí minh bạch và sự bảo vệ giao dịch bởi EduShare.
            </p>
          </div>

          <div className="mx-auto max-w-2xl">
            <Card className="rounded-[2rem] border-border/60 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 pb-8 text-center pt-8">
                <Badge variant="secondary" className="mx-auto w-fit rounded-full mb-4">Member / Standard User</Badge>
                <CardTitle className="text-2xl">{MEMBERSHIP_PLAN.title}</CardTitle>
                <CardDescription className="mt-2">{MEMBERSHIP_PLAN.desc}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 -mt-4">
                <div className="rounded-[1.75rem] border border-border bg-primary/5 p-6 shadow-inner">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phí thành viên</p>
                      <div className="mt-1 text-3xl font-black text-foreground">{MEMBERSHIP_PLAN.price}</div>
                    </div>
                    <Badge className="rounded-full px-3 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">Ưu đãi sinh viên</Badge>
                  </div>
                  
                  <div className="mt-8 space-y-4">
                    {MEMBERSHIP_PLAN.benefits.map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-2xl border border-border/50 bg-background/80 px-4 py-3.5 text-sm shadow-sm">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button 
                      className="rounded-full flex-1 h-12 text-base font-semibold shadow-md" 
                      onClick={handleUpgradeVip} 
                      disabled={isUpgrading || (isAuthenticated && user?.role?.toLowerCase() !== 'guest')}
                    >
                      {isUpgrading ? "Đang xử lý..." : (!isAuthenticated ? "Đăng nhập để đăng ký ngay" : (user?.role?.toLowerCase() !== 'guest' ? "Bạn đã là VIP" : "Nâng cấp VIP ngay (29k)"))}
                    </Button>
                    <Button asChild variant="outline" className="rounded-full flex-1 h-12 text-base font-medium">
                      <a href="#groups">Xem nhóm đang chờ ghép</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="groups" className="mt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Nhóm nổi bật</h2>
              <p className="mt-2 text-muted-foreground">Các nhóm đang chờ ghép, giá rõ ràng, slot minh bạch.</p>
            </div>
            <Button variant="ghost" className="rounded-full" asChild>
              <Link to="/groups">
                Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoadingGroups ? (
            <div className="flex items-center justify-center p-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : featuredGroups.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {featuredGroups.map((group) => {
                const isFull = group.occupiedSlots >= group.totalSlots;
                const tag = isFull ? 'Hết chỗ' : 'Còn slot';
                const price = new Intl.NumberFormat('vi-VN').format(group.price || 0) + ' đ';
                return (
                  <Card key={group._id} className="rounded-[1.5rem] border-border/60 shadow-sm transition-transform hover:-translate-y-0.5">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <Badge variant={isFull ? 'secondary' : 'default'} className={`rounded-full px-3 py-1 text-xs ${!isFull && 'bg-emerald-500 hover:bg-emerald-600'}`}>
                          {tag}
                        </Badge>
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                          {group.category || 'Productivity'}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white">
                          E
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold leading-6">{group.name || group.platform || 'Chưa cập nhật'}</h3>
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {group.ownerId?.trustScore?.toFixed(1) || '5.0'}
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">{group.description || 'Không có mô tả.'}</p>

                      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Giá</p>
                          <div className="text-lg font-bold">{price}</div>
                        </div>
                        <Button size="sm" className="rounded-full bg-slate-900 text-white hover:bg-slate-800" asChild>
                          <Link to="/groups">Xem</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">Chưa có nhóm nào.</div>
          )}
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
