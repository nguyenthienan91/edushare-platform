import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { UserService } from '@/services/user.service'
import { GroupService } from '@/services/group.service'
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Star,
  Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'


const MEMBERSHIP_PLAN = {
  title: 'Member / Standard User',
  price: '29.000 credit / tháng',
  desc: 'Sinh viên đã đóng phí thành viên 29.000 credit/tháng.',
  benefits: [
    'Được tham gia nhóm đang chờ ghép',
    'Dùng escrow để bảo vệ giao dịch',
    'Xem Trust Score và lịch sử rõ ràng',
    'Được hỗ trợ khi phát sinh tranh chấp',
  ],
}





const BENEFITS = [
  { icon: ShieldCheck, text: 'Thanh toán an toàn' },
  { icon: Bell, text: 'Hỗ trợ 24/7' },
  { icon: Wallet, text: 'Thanh toán VietQR' },
]

const SUPPORT_ITEMS = [
  'Thông tin email hoặc dữ liệu cần thiết được lưu cùng đơn.',
  'Mã đơn, số tiền và trạng thái thanh toán được ghi nhận rõ.',
  'Yêu cầu gia hạn hoặc hỗ trợ lại được theo dõi trong cùng đơn.',
]



const FAQS = [
  { question: 'Tôi có được hoàn tiền không?', answer: 'Có, nếu giao dịch thất bại hoặc có tranh chấp được xác minh, hệ thống sẽ hoàn tiền theo kết quả xử lý.' },
  { question: 'Membership hết hạn thì sao?', answer: 'Khi membership hết hạn, quyền tham gia nhóm sẽ tạm khóa cho đến khi bạn gia hạn lại.' },
  { question: 'Có phí ẩn không?', answer: 'Không. EduShare hiển thị rõ phí membership và các khoản liên quan trước khi bạn xác nhận.' },
  { question: 'Tôi cần chuẩn bị gì khi hỗ trợ?', answer: 'Chỉ cần mô tả giao dịch và cung cấp minh chứng như ảnh chụp màn hình hoặc thông tin thanh toán.' },
]

const TESTIMONIALS = [
  { 
    name: 'Minh Anh', 
    role: 'Sinh viên năm 3, ĐH Bách Khoa', 
    text: 'Mình thấy hệ thống rõ ràng, xem Trust Score nhanh và cảm giác an tâm hơn khi tham gia nhóm.',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MinhAnh'
  },
  { 
    name: 'Hồng Nhung', 
    role: 'Chủ nhóm Canva', 
    text: 'Quản lý slot và xác nhận thành viên gọn hơn nhiều so với nhắn tin thủ công.',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=HongNhung'
  },
  { 
    name: 'Tuấn Khải', 
    role: 'Người dùng thường xuyên', 
    text: 'Escrow giúp mình yên tâm hơn, nhất là khi tham gia nhóm phần mềm có giá trị cao.',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TuanKhai'
  },
]

export default function LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
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

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length)
  }

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-12 lg:grid-cols-2 items-center ">
          <div className="space-y-8">
            <div className="space-y-6">
              
              <h1 className="text-5xl font-black tracking-tight sm:text-6xl text-foreground leading-[1.1] relative">
                Mua chung tài khoản số để <br />
                <span className="relative inline-block text-emerald-500 dark:text-emerald-400 mt-2">
                  Tăng Hiệu Suất
                  <svg className="absolute left-0 -bottom-2 w-full h-3 text-emerald-400 dark:text-emerald-500/60" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </span> <br />
                của bạn
              </h1>
              <p className="text-base leading-7 text-muted-foreground sm:text-lg max-w-xl">
                EduShare giúp sinh viên ghép nhóm các gói Canva, Microsoft 365, Adobe, AI tools... với escrow,
                Trust Score và quản lý thành viên tự động để giảm scam, giảm thao tác thủ công.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <Button asChild size="lg" className="rounded-full px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20">
                <a href="#groups">Bắt đầu ngay</a>
              </Button>
              <a href="#demo" className="flex items-center gap-2.5 text-sm font-bold text-foreground hover:text-primary transition-colors group">
                <span className="flex size-10 items-center justify-center rounded-full border border-border bg-background hover:bg-muted shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="size-3 text-foreground fill-current ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                Xem hướng dẫn
              </a>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-4">
              {BENEFITS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/30">
                  <Icon className="h-4 w-4 text-emerald-500" /> {text}
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end px-6 lg:px-0 w-full h-full min-h-[460px] lg:h-[500px]">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-100/30 to-violet-100/30 dark:from-emerald-950/10 dark:to-violet-950/10 rounded-2xl blur-3xl" />

            <div className="relative w-full max-w-[380px] h-full min-h-[460px] lg:h-[500px] rounded-2xl overflow-hidden border border-emerald-500/10 shadow-2xl">
              <img 
                src="/images/student_edu.png" 
                alt="Student studying in library" 
                className="w-full h-full object-cover mix-blend-normal brightness-105" 
              />
            </div>

            {/* Floating Widget 1: Deposit Form */}
            <div className="absolute -top-4 left-2 sm:-left-6 flex items-center gap-3 rounded-2xl bg-background/95 dark:bg-slate-900/95 p-3.5 shadow-xl border border-border/40 backdrop-blur-md animate-float-slow">
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase">Số tiền nạp</p>
                <p className="text-xs font-black text-foreground mt-0.5">50.000 ₫</p>
              </div>
              <button className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm hover:bg-emerald-600 transition-colors">
                Nạp tiền
              </button>
            </div>

            {/* Floating Widget 2: Purple Check Badge */}
            <div className="absolute left-[-1.5rem] top-1/3 flex size-8 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/20 animate-float-delayed">
              <svg className="size-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Floating Widget 3: Balance Stat */}
            <div className="absolute -left-8 bottom-12 flex items-center gap-2.5 rounded-xl bg-background/95 dark:bg-slate-900/95 p-3 shadow-xl border border-border/40 backdrop-blur-md animate-float-slow">
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase">Số dư ví</p>
                <p className="text-xs font-black text-foreground">250.000 ₫</p>
              </div>
              <div className="flex items-end gap-0.5 h-4 ml-1">
                <div className="w-1 bg-emerald-500 h-2 rounded-full" />
                <div className="w-1 bg-emerald-500 h-3 rounded-full" />
                <div className="w-1 bg-emerald-500 h-4 rounded-full" />
              </div>
            </div>

            {/* Floating Widget 4: Orange Talk Bubble */}
            <div className="absolute right-[-1rem] bottom-8 flex size-9 items-center justify-center rounded-xl bg-orange-400 text-white shadow-lg shadow-orange-400/20 animate-float-delayed">
              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
              </svg>
            </div>

            {/* Floating Widget 5: Black Credit Card */}
            <div className="absolute -right-12 top-1/3 w-[140px] aspect-[1.58/1] rounded-xl bg-slate-950 text-white p-3.5 shadow-2xl border border-white/10 dark:border-white/5 backdrop-blur-md flex flex-col justify-between animate-float-slow transform rotate-6">
              <div className="flex justify-between items-start">
                <div className="size-5 rounded-full bg-white/20" />
                <span className="text-[7px] text-white/50 font-medium">EduCard</span>
              </div>
              <div>
                <p className="text-[8px] font-mono tracking-widest text-white/90">•••• 5678</p>
                <p className="text-[6px] text-white/40 mt-1 uppercase">Nguyễn Thiên An</p>
              </div>
            </div>

            {/* Floating Widget 6: Database Badge */}
            <div className="absolute -right-6 top-10 flex size-8 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/20 animate-float-slow">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
          </div>
        </section>

        <div className="mt-8 border-t border-border/60 pt-10 text-center pb-8">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Được tin dùng sinh viên tại các trường đại học</p>
         
        </div>

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


        <section id="pricing" className="mt-20">
          <div className="mb-10 text-center flex flex-col items-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Gói 29.000 credit / tháng</h2>
            <p className="mt-3 text-base text-muted-foreground max-w-2xl">
              Nâng cấp trải nghiệm EduShare với gói định kỳ, giúp bạn tham gia nhóm đang chờ ghép nhanh chóng, với chi phí minh bạch và sự bảo vệ giao dịch bởi EduShare.
            </p>
          </div>

          <div className="mx-auto max-w-2xl">
            <Card className=" border-border/60 shadow-sm overflow-hidden">
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
                      {isUpgrading ? "Đang xử lý..." : (!isAuthenticated ? "Đăng nhập để đăng ký ngay" : (user?.role?.toLowerCase() !== 'guest' ? "Bạn đã là VIP" : "Nâng cấp VIP ngay (29.000 credit)"))}
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


        <section className="mt-24 grid gap-16 lg:grid-cols-2 items-center">
          <style>{`
            @keyframes float-slow {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            @keyframes float-delayed {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(8px); }
            }
            .animate-float-slow {
              animation: float-slow 4s ease-in-out infinite;
            }
            .animate-float-delayed {
              animation: float-delayed 4.5s ease-in-out infinite;
            }
          `}</style>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground leading-[1.15]">
                Mua nhanh, biết rõ<br />mình nhận gì
              </h2>
              <p className="text-base text-muted-foreground max-w-lg leading-relaxed">
                EduShare tập trung các nhóm thuê bao thường dùng, giá rõ ràng, dễ theo dõi và hỗ trợ nhanh.
              </p>
            </div>

            <ul className="space-y-5">
              {[
                "Giá rõ ràng, minh bạch trước khi tham gia",
                "Thanh toán an toàn qua cổng giao dịch Escrow",
                "Tra cứu lịch sử đơn hàng và dòng tiền dễ dàng",
                "Theo dõi thời hạn và slot còn trống thời gian thực",
                "Đội ngũ hỗ trợ nhanh chóng theo từng đơn hàng"
              ].map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-4">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/20">
                    <svg className="size-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-base font-semibold text-foreground/90">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex justify-center lg:justify-end px-6 lg:px-0">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-100/30 to-violet-100/30 dark:from-emerald-950/10 dark:to-violet-950/10 rounded-[3rem] blur-3xl" />

            <div className="relative w-full max-w-[460px] aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border border-border/40 bg-muted">
              <img 
                src="/images/workspace_laptop_mockup.png" 
                alt="EduShare Workspace" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>

            {/* Floating Widget 1: User Profile */}
            <div className="absolute -top-6 left-2 sm:-left-6 flex items-center gap-3 rounded-2xl bg-background/95 dark:bg-slate-900/95 p-3.5 shadow-xl border border-border/40 backdrop-blur-md animate-float-slow">
              <img src="/images/logo.jpg" alt="Avatar" className="size-10 rounded-full object-cover ring-2 ring-emerald-500/20" />
              <div>
                <p className="text-xs font-bold text-foreground">Nguyễn Thiên An</p>
                <p className="text-[10px] text-muted-foreground font-medium">Chủ nhóm uy tín (5.0★)</p>
              </div>
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-black ml-2 shadow-sm">
                P
              </span>
            </div>

            {/* Floating Widget 2: Escrow Success Status */}
            <div className="absolute -bottom-6 left-6 sm:left-12 flex items-center gap-2.5 rounded-2xl bg-background/95 dark:bg-slate-900/95 px-4.5 py-3 shadow-xl border border-border/40 backdrop-blur-md animate-float-delayed">
              <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <svg className="size-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-xs font-bold text-foreground tracking-tight">Giao dịch Escrow thành công!</span>
            </div>

            {/* Floating Widget 3: Stats */}
            <div className="absolute top-1/4 -right-4 sm:-right-8 flex items-center gap-3.5 rounded-2xl bg-background/95 dark:bg-slate-900/95 p-3.5 shadow-xl border border-border/40 backdrop-blur-md animate-float-delayed">
              <div>
                <p className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">Tiết kiệm trung bình</p>
                <p className="text-xs font-black text-foreground mt-0.5">75% chi phí/tháng</p>
              </div>
              <div className="flex items-end gap-1 h-6">
                <div className="w-1 bg-emerald-200 dark:bg-emerald-900/50 h-3 rounded-full" />
                <div className="w-1 bg-emerald-300 dark:bg-emerald-800/50 h-4 rounded-full" />
                <div className="w-1 bg-emerald-500 h-6 rounded-full" />
              </div>
            </div>

            {/* Floating Widget 4: Accent Badge */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 animate-float-slow">
              <Wallet className="size-4" />
            </div>
          </div>
        </section>

        <section className="mt-16">
          <Card className=" border-border/60 shadow-sm">
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
        <section id="testimonials" className="mt-24 grid gap-12 lg:grid-cols-2 items-center py-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">Cảm nhận từ sinh viên</span>
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
                Cộng đồng nói gì<br />về chúng tôi
              </h2>
            </div>
            <p className="text-base text-muted-foreground max-w-md leading-relaxed">
              Hãy nghe những chia sẻ thực tế từ các bạn sinh viên và chủ nhóm đã tin tưởng đồng hành cùng nền tảng ghép nhóm EduShare.
            </p>

            <div className="flex gap-2.5 mt-8">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`size-2.5 rounded-full transition-all duration-300 ${
                    idx === activeTestimonial 
                      ? 'bg-slate-900 dark:bg-white w-6' 
                      : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 w-full">
            {/* Cards Stack Container */}
            <div className="relative flex-1 h-[260px] sm:h-[220px]">
              {TESTIMONIALS.map((item, idx) => {
                const isActive = idx === activeTestimonial;
                const isNext = idx === (activeTestimonial + 1) % TESTIMONIALS.length;
                
                if (!isActive && !isNext) return null;

                return (
                  <div 
                    key={item.name}
                    className={`absolute top-0 left-0 w-[90%] sm:w-[94%] bg-background border border-border/50 shadow-xl rounded-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[220px] transition-all duration-500 ease-in-out ${
                      isActive 
                        ? 'z-20 opacity-100 scale-100 translate-x-0 translate-y-0' 
                        : 'z-10 opacity-30 scale-95 translate-x-6 translate-y-6 blur-[0.5px] pointer-events-none'
                    }`}
                  >
                    {/* Profile Avatar overlapping top-left */}
                    <div className="absolute -top-6 -left-6 size-12 rounded-full overflow-hidden border-2 border-background dark:border-slate-950 shadow-md">
                      <img src={item.avatar} alt={item.name} className="w-full h-full object-cover bg-emerald-500/10" />
                    </div>

                    <div>
                      {/* 5 Stars */}
                      <div className="mb-4 flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm sm:text-base font-medium leading-relaxed text-muted-foreground italic">
                        “{item.text}”
                      </p>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-bold text-foreground">{item.name}</div>
                      <div className="text-xs text-muted-foreground font-medium">{item.role}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vertical Navigation Controls on the very right */}
            <div className="flex flex-col gap-2 shrink-0">
              <button 
                onClick={prevTestimonial}
                className="flex size-9 items-center justify-center rounded-full border border-border bg-background hover:bg-muted shadow-sm transition-colors text-muted-foreground hover:text-foreground focus:outline-none"
              >
                <ChevronUp className="size-5" />
              </button>
              <button 
                onClick={nextTestimonial}
                className="flex size-9 items-center justify-center rounded-full border border-border bg-background hover:bg-muted shadow-sm transition-colors text-muted-foreground hover:text-foreground focus:outline-none"
              >
                <ChevronDown className="size-5" />
              </button>
            </div>
          </div>
        </section>

        <section id="faq" className="mt-16 pb-24">
          <Card className=" border-border/60 shadow-sm">
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
          <Card className=" border-border/60 bg-gradient-to-r from-primary to-sky-500 text-white shadow-sm">
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
