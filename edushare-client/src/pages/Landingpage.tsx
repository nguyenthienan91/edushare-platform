import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { UserService } from '@/services/user.service'
import { GroupService } from '@/services/group.service'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Star,
  Wallet,
  MousePointerClick,
  CreditCard,
  Headphones,
  Compass,
  Send,
  Heart,
  BookOpen,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'


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

  useGSAP(() => {
    // Hero Animations
    gsap.from('.hero-title', {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    })
    
    gsap.from('.hero-subtitle', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      delay: 0.2,
      ease: 'power3.out',
    })
    
    gsap.from('.hero-cta', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      delay: 0.4,
      ease: 'power3.out',
    })

    gsap.from('.hero-image-wrapper', {
      scale: 0.95,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: 'power3.out',
    })

    // Scroll trigger animations for featured groups
    gsap.from('.featured-group-card', {
      scrollTrigger: {
        trigger: '.featured-groups-section',
        start: 'top 85%',
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
    })

    // Scroll trigger for pricing
    gsap.from('#pricing .lg\\:col-span-7', {
      scrollTrigger: {
        trigger: '#pricing',
        start: 'top 85%',
      },
      x: -40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    })

    gsap.from('#pricing .lg\\:col-span-5', {
      scrollTrigger: {
        trigger: '#pricing',
        start: 'top 85%',
      },
      x: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    })

    // Scroll trigger for features
    gsap.from('#features .space-y-8', {
      scrollTrigger: {
        trigger: '#features',
        start: 'top 85%',
      },
      x: -40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    })

    gsap.from('#features .relative', {
      scrollTrigger: {
        trigger: '#features',
        start: 'top 85%',
      },
      x: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    })

    // Scroll trigger for support
    gsap.from('#support .space-y-8', {
      scrollTrigger: {
        trigger: '#support',
        start: 'top 85%',
      },
      x: -40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    })

    gsap.from('#support .relative', {
      scrollTrigger: {
        trigger: '#support',
        start: 'top 85%',
      },
      x: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    })

    // Scroll trigger for testimonials
    gsap.from('#testimonials .space-y-6', {
      scrollTrigger: {
        trigger: '#testimonials',
        start: 'top 85%',
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    })

    gsap.from('#testimonials .flex-1', {
      scrollTrigger: {
        trigger: '#testimonials',
        start: 'top 85%',
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      delay: 0.15,
      ease: 'power3.out',
    })

    // Scroll trigger for faq
    gsap.from('#faq .mb-12', {
      scrollTrigger: {
        trigger: '#faq',
        start: 'top 85%',
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    })

    gsap.from('#faq .space-y-4 > div', {
      scrollTrigger: {
        trigger: '#faq',
        start: 'top 80%',
      },
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
    })
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
              
              <h1 className="hero-title text-5xl font-black tracking-tight sm:text-6xl text-foreground leading-[1.1] relative">
                Mua chung tài khoản số để <br />
                <span className="relative inline-block text-emerald-500 dark:text-emerald-400 mt-2">
                  Tăng Hiệu Suất
                  <svg className="absolute left-0 -bottom-2 w-full h-3 text-emerald-400 dark:text-emerald-500/60" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </span> <br />
                của bạn
              </h1>
              <p className="hero-subtitle text-base leading-7 text-muted-foreground sm:text-lg max-w-xl">
                EduShare giúp sinh viên ghép nhóm các gói Canva, Microsoft 365, Adobe, AI tools... với escrow,
                Trust Score và quản lý thành viên tự động để giảm scam, giảm thao tác thủ công.
              </p>
            </div>

            <div className="hero-cta flex flex-wrap items-center gap-5">
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
          <div className="hero-image-wrapper relative flex justify-center lg:justify-end px-6 lg:px-0 w-full h-full min-h-[460px] lg:h-[500px]">
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
            <div className="featured-groups-section grid gap-4 md:grid-cols-3">
              {featuredGroups.map((group) => {
                const isFull = group.occupiedSlots >= group.totalSlots;
                const tag = isFull ? 'Hết chỗ' : 'Còn slot';
                const price = new Intl.NumberFormat('vi-VN').format(group.price || 0) + ' đ';
                return (
                  <Card key={group._id} className="featured-group-card rounded-[1.5rem] border-border/60 shadow-sm transition-transform hover:-translate-y-0.5">
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


        <section id="pricing" className="mt-28">
          <div className="mb-14 text-center flex flex-col items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">
              Bảng giá dịch vụ
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
              Gói Thành Viên Standard
            </h2>
            <p className="mt-3 text-base text-muted-foreground max-w-2xl leading-relaxed">
              Nâng cấp trải nghiệm EduShare với gói định kỳ, giúp bạn tham gia nhóm đang chờ ghép nhanh chóng, với chi phí minh bạch và sự bảo vệ giao dịch bởi EduShare.
            </p>
          </div>

          <div className="mx-auto max-w-5xl grid gap-10 lg:grid-cols-12 items-center">
            {/* Left Part: Info & Benefits list */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <Badge variant="secondary" className="w-fit rounded-full px-3 py-1 text-xs">
                  Member / Standard User
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {MEMBERSHIP_PLAN.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {MEMBERSHIP_PLAN.desc}
                </p>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2 pt-2">
                {MEMBERSHIP_PLAN.benefits.map((item) => (
                  <div 
                    key={item} 
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 text-sm shadow-sm transition-all duration-300 hover:border-emerald-500/30"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-semibold text-foreground/80 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Part: Checkout Price Box */}
            <div className="lg:col-span-5 relative">
              {/* Soft Gradient Background Panel */}
              <div className="absolute -inset-2 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 dark:from-emerald-950/20 dark:to-blue-950/20 rounded-[2.5rem] blur-2xl opacity-70" />
              
              <div className="relative border border-border/80 bg-card rounded-[2rem] p-7 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phí đăng ký</p>
                    <div className="text-2xl sm:text-3xl font-black text-foreground">
                      29.000 credit <span className="text-xs font-normal text-muted-foreground">/ tháng</span>
                    </div>
                  </div>
                  <Badge className="rounded-full px-3 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 border-none shrink-0 shadow-sm text-xs font-bold">
                    Ưu đãi sinh viên
                  </Badge>
                </div>

                <div className="text-xs leading-relaxed text-muted-foreground/80 bg-muted/40 rounded-xl p-3.5 border border-border/40">
                  Phí thành viên được thanh toán bằng credit và tự động gia hạn mỗi tháng. Bạn có thể hủy gói bất kỳ lúc nào từ cài đặt tài khoản.
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    className="rounded-full w-full h-12 text-base font-bold shadow-md bg-emerald-500 hover:bg-emerald-600 text-white border-none transition-colors" 
                    onClick={handleUpgradeVip} 
                    disabled={isUpgrading || (isAuthenticated && user?.role?.toLowerCase() !== 'guest')}
                  >
                    {isUpgrading ? "Đang xử lý..." : (!isAuthenticated ? "Đăng nhập để đăng ký ngay" : (user?.role?.toLowerCase() !== 'guest' ? "Bạn đã là VIP" : "Nâng cấp VIP ngay (29.000 credit)"))}
                  </Button>
                  <Button asChild variant="outline" className="rounded-full w-full h-12 text-base font-semibold">
                    <a href="#groups">Xem nhóm đang chờ ghép</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>


        <section id="features" className="mt-24 grid gap-16 lg:grid-cols-2 items-center">
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

        <section id="support" className="mt-28 grid gap-12 lg:grid-cols-2 items-center">
          {/* Left Column: Subtitle, Title, Steps */}
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">
                Mua nhanh, biết rõ
              </span>
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground leading-[1.15]">
                Cần hỗ trợ?<br />Có người theo đơn
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg leading-relaxed mt-2">
                Với gói cần email hoặc thao tác thủ công, thông tin bạn nhập được ghi nhận đầy đủ để đội hỗ trợ tiếp nhận đúng việc.
              </p>
            </div>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-5 items-start">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shadow-sm shadow-amber-500/5">
                  <MousePointerClick className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">
                    Thông tin lưu cùng đơn
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Thông tin email hoặc dữ liệu cần thiết được lưu cùng đơn.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-5 items-start">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 shadow-sm shadow-rose-500/5">
                  <CreditCard className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">
                    Ghi nhận thanh toán rõ ràng
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Mã đơn, số tiền và trạng thái thanh toán được ghi nhận rõ.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-5 items-start">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500 shadow-sm shadow-teal-500/5">
                  <Headphones className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">
                    Theo dõi & Hỗ trợ kịp thời
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Yêu cầu gia hạn hoặc hỗ trợ lại được theo dõi trong cùng đơn.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Creative card mockup with overlapping ongoing widget */}
          <div className="relative flex justify-center lg:justify-end px-6 lg:px-0">
            {/* Soft Ambient Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-100/20 to-blue-100/20 dark:from-emerald-950/5 dark:to-blue-950/5 rounded-[3rem] blur-3xl" />
            
            {/* Main Premium Card (Greece Trip counterpart) */}
            <div className="relative w-full max-w-[370px] bg-card text-card-foreground rounded-[2rem] shadow-xl border border-border/40 p-5 space-y-4">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-inner bg-muted">
                <img 
                  src="/images/edu_sharing_card.png" 
                  alt="EduShare Account Sharing" 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2.5 px-1">
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  Gói học tập Canva Pro
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Gia hạn tự động</span>
                  <span>•</span>
                  <span>Bởi EduShare Support</span>
                </div>

                {/* Interactive Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button className="flex size-9 items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors shadow-sm">
                    <BookOpen className="size-4" />
                  </button>
                  <button className="flex size-9 items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors shadow-sm">
                    <Compass className="size-4" />
                  </button>
                  <button className="flex size-9 items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors shadow-sm">
                    <Send className="size-4" />
                  </button>
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span>12 slot đang hoạt động</span>
                  </div>
                  <button className="text-rose-500 hover:text-rose-600 transition-colors">
                    <Heart className="size-4 fill-rose-500/10 hover:fill-rose-500" />
                  </button>
                </div>
              </div>

              {/* Overlapping Floating Card Widget (Rome Trip counterpart) */}
              <div className="absolute -bottom-6 -right-4 sm:-right-8 flex items-start gap-3 rounded-2xl bg-background/95 dark:bg-slate-900/95 p-3.5 shadow-2xl border border-border/40 backdrop-blur-md w-[220px] animate-float-delayed">
                <div className="size-11 shrink-0 rounded-full overflow-hidden bg-muted border border-border/30 shadow-sm">
                  <img src="/images/rome_icon.png" alt="Microsoft 365" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Đang xử lý</p>
                  <p className="text-xs font-extrabold text-foreground truncate">Microsoft 365 Family</p>
                  
                  <div className="pt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-emerald-500">80% hoàn thành</span>
                      <span className="text-muted-foreground">4/5 slots</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '80%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

        <section id="faq" className="mt-28 pb-24">
          <div className="mb-12 text-center flex flex-col items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">
              Câu hỏi thường gặp
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
              Câu hỏi thường gặp
            </h2>
            <p className="mt-3 text-base text-muted-foreground max-w-2xl leading-relaxed">
              Tìm câu trả lời nhanh cho những thắc mắc phổ biến nhất về EduShare.
            </p>
          </div>

          <div className="mx-auto max-w-4xl space-y-4">
            {FAQS.map((item, index) => {
              const isOpen = openFaqIndex === index
              return (
                <div 
                  key={item.question} 
                  className="rounded-[1.25rem] border border-border/80 bg-card hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors overflow-hidden"
                >
                  <button 
                    type="button" 
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)} 
                    className="flex w-full items-center justify-between px-6 py-5 text-left font-bold text-foreground focus:outline-none"
                  >
                    <span className="text-base sm:text-lg">{item.question}</span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-[300px] border-t border-border/50' : 'max-h-0'
                    }`}
                  >
                    <div className="px-6 py-5 text-sm sm:text-base leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>


      </main>
    </div>
  )
}
