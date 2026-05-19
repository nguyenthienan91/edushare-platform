import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Filter,
  Lock,
  MessageSquareQuote,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react'

type Category = 'All' | 'Productivity' | 'Design' | 'AI Tools' | 'Entertainment'

type SortOption = 'Uy tín cao nhất' | 'Giá thấp nhất' | 'Phổ biến nhất'

type GroupCard = {
  id: number
  platform: string
  emoji: string
  category: Exclude<Category, 'All'>
  verifiedOwner: boolean
  trustedOwner: boolean
  trustScore: number
  successRate: number
  availableSlots: number
  totalSlots: number
  price: number
  escrowProtected: boolean
  autoRenewal: boolean
  popularity: number
  description: string
}

type ActivityItem = {
  id: number
  title: string
  subtitle: string
  time: string
  type: 'join' | 'release' | 'verified'
}

const categories: Category[] = ['All', 'Productivity', 'Design', 'AI Tools', 'Entertainment']
const sortOptions: SortOption[] = ['Uy tín cao nhất', 'Giá thấp nhất', 'Phổ biến nhất']

const groups: GroupCard[] = [
  {
    id: 1,
    platform: 'Nhóm Canva Pro',
    emoji: '🎨',
    category: 'Design',
    verifiedOwner: true,
    trustedOwner: true,
    trustScore: 98,
    successRate: 99,
    availableSlots: 2,
    totalSlots: 6,
    price: 39000,
    escrowProtected: true,
    autoRenewal: true,
    popularity: 98,
    description: 'Phù hợp cho sinh viên thiết kế và người sáng tạo nội dung cần truy cập cộng tác.',
  },
  {
    id: 2,
    platform: 'Nhóm ChatGPT Plus cho học tập',
    emoji: '✨',
    category: 'AI Tools',
    verifiedOwner: true,
    trustedOwner: true,
    trustScore: 96,
    successRate: 98,
    availableSlots: 1,
    totalSlots: 5,
    price: 59000,
    escrowProtected: true,
    autoRenewal: true,
    popularity: 95,
    description: 'Cộng tác AI an toàn cho nghiên cứu, viết lách và quy trình làm việc năng suất.',
  },
  {
    id: 3,
    platform: 'Nhóm Microsoft 365 cho sinh viên',
    emoji: '💼',
    category: 'Productivity',
    verifiedOwner: true,
    trustedOwner: false,
    trustScore: 91,
    successRate: 97,
    availableSlots: 3,
    totalSlots: 6,
    price: 32000,
    escrowProtected: true,
    autoRenewal: false,
    popularity: 89,
    description: 'Truy cập cộng tác cho tài liệu, lưu trữ và dự án học tập.',
  },
  {
    id: 4,
    platform: 'Nhóm Spotify Gia đình',
    emoji: '🎧',
    category: 'Entertainment',
    verifiedOwner: true,
    trustedOwner: true,
    trustScore: 94,
    successRate: 99,
    availableSlots: 1,
    totalSlots: 6,
    price: 28000,
    escrowProtected: true,
    autoRenewal: true,
    popularity: 92,
    description: 'Chia sẻ âm nhạc cho sinh viên muốn trải nghiệm hàng tháng ổn định, mượt mà.',
  },
  {
    id: 5,
    platform: 'Nhóm Adobe Sáng tạo',
    emoji: '🖌️',
    category: 'Design',
    verifiedOwner: true,
    trustedOwner: true,
    trustScore: 97,
    successRate: 98,
    availableSlots: 2,
    totalSlots: 4,
    price: 69000,
    escrowProtected: true,
    autoRenewal: true,
    popularity: 91,
    description: 'Bộ công cụ sáng tạo cao cấp với chủ sở hữu đã xác minh và phạm vi bảo vệ escrow.',
  },
  {
    id: 6,
    platform: 'Nhóm xem Netflix dùng chung',
    emoji: '🍿',
    category: 'Entertainment',
    verifiedOwner: true,
    trustedOwner: false,
    trustScore: 88,
    successRate: 95,
    availableSlots: 2,
    totalSlots: 4,
    price: 45000,
    escrowProtected: true,
    autoRenewal: false,
    popularity: 84,
    description: 'Nhóm giải trí với quy trình tham gia nhẹ nhàng, dễ dùng cho sinh viên.',
  },
]

const activities: ActivityItem[] = [
  { id: 1, title: 'Ngọc đã tham gia Canva Pro Circle', subtitle: 'Escrow đã giải ngân sau khi xác nhận', time: '2 minutes ago', type: 'join' },
  { id: 2, title: 'Thanh toán Microsoft 365 được giữ an toàn', subtitle: 'Chủ nhóm đang chuẩn bị thông tin truy cập', time: '12 minutes ago', type: 'release' },
  { id: 3, title: 'Adobe Creative Circle đã được xác minh', subtitle: 'Điểm tin cậy đã được cập nhật lên 97', time: '1 hour ago', type: 'verified' },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ'
}

function Badge({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'slate' | 'emerald' | 'indigo' | 'sky' }) {
  const tones = {
    slate: 'bg-slate-100  ring-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    sky: ' text-sky-700 ring-sky-200',
  }

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tones[tone]}`}>{children}</span>
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border border-slate-200  p-5 shadow-sm">
      <div className="mb-3 inline-flex rounded-2xl  p-3 text-indigo-600">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-bold ">{value}</div>
      <div className="mt-1 text-sm ">{label}</div>
    </div>
  )
}

export default function MemberParticipantPageNew() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All')
  const [sortBy, setSortBy] = useState<SortOption>('Uy tín cao nhất')
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<GroupCard | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const filteredGroups = useMemo(() => {
    const filtered = groups.filter((group) => {
      const matchesCategory = selectedCategory === 'All' || group.category === selectedCategory
      const matchesSearch = `${group.platform} ${group.category}`.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'Uy tín cao nhất') return b.trustScore - a.trustScore
      if (sortBy === 'Giá thấp nhất') return a.price - b.price
      return b.popularity - a.popularity
    })
  }, [search, selectedCategory, sortBy])

  return (
    <div className="min-h-screen  from-slate-50 via-white to-sky-50 ">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="overflow-hidden rounded-[32px] border border-slate-200  shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
        >
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-10">
            <div>
              <Badge tone="indigo">Truy cập cộng tác đáng tin cậy cho sinh viên</Badge>
              <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Chia sẻ thuê bao đáng tin cậy dành cho sinh viên
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7  sm:text-lg">
                Tham gia các nhóm thuê bao đã xác minh với thanh toán được bảo vệ bởi escrow, điểm uy tín minh bạch và quy trình an toàn dành cho cộng đồng sinh viên.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-500">
                  Khám phá nhóm <ArrowRight className="h-4 w-4" />
                </button>
                <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200  px-5 py-3 text-sm font-semibold  transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700">
                  Trở thành chủ nhóm <Sparkles className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Thành viên hoạt động" value="12.4k" icon={Users} />
                <StatCard label="Giao dịch thành công" value="48.9k" icon={CheckCircle2} />
                <StatCard label="Tỷ lệ tin cậy" value="98.7%" icon={ShieldCheck} />
                <StatCard label="Thanh toán được bảo vệ bởi escrow" value="100%" icon={Lock} />
              </div>
            </div>

            <div className="rounded-[28px] r from-indigo-600 via-sky-500 to-emerald-500 p-[1px] shadow-lg">
              <div className="h-full rounded-[27px]  p-6">
                <div className="flex items-center justify-between">
                  <Badge tone="emerald">Điểm nhấn chủ nhóm đã xác minh</Badge>
                  <Badge tone="sky">Thân thiện với sinh viên</Badge>
                </div>
                <div className="mt-6 rounded-3xl  p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl r from-indigo-500 to-sky-500 text-3xl text-white shadow-lg">
                      ✨
                    </div>
                    <div>
                      <div className="text-lg font-bold ">ChatGPT Plus Study Hub</div>
                      <div className="mt-1 text-sm ">Công cụ AI • còn 1 slot</div>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl  p-4">
                      <div className="">Điểm uy tín</div>
                      <div className="mt-1 text-2xl font-bold ">96/100</div>
                    </div>
                    <div className="rounded-2xl  p-4">
                      <div className="">Tỷ lệ thành công</div>
                      <div className="mt-1 text-2xl font-bold ">98%</div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    Escrow giữ tiền an toàn cho đến khi quyền truy cập được xác nhận, giúp sinh viên tham gia một cách yên tâm.
                  </div>
                </div>
                <div className="mt-5 space-y-3 text-sm ">
                  <div className="flex items-center gap-3"><BadgeCheck className="h-4 w-4 text-emerald-500" /> Chủ nhóm đã xác minh và lịch sử hồ sơ rõ ràng</div>
                  <div className="flex items-center gap-3"><TrendingUp className="h-4 w-4 text-sky-500" /> Điểm tin cậy cao với nhiều lượt tham gia thành công</div>
                  <div className="flex items-center gap-3"><Wallet className="h-4 w-4 text-indigo-500" /> Luồng thanh toán an toàn qua ví</div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mt-8 rounded-[32px] border border-slate-200  p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Khám phá các nhóm thuê bao</h2>
              <p className="mt-1 text-sm ">Tìm kiếm các nhóm đã xác minh với quy trình tham gia được bảo vệ bởi escrow và huy hiệu chủ nhóm đáng tin cậy.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm Canva, ChatGPT Plus, Microsoft 365..."
                  className="w-full rounded-2xl border border-slate-200  py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-300 focus: sm:w-80"
                />
              </div>
              <div className="relative">
                <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none rounded-2xl border border-slate-200  py-3 pl-11 pr-10 text-sm outline-none transition focus:border-indigo-300 focus:"
                >
                  {sortOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedCategory === category ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100  hover:bg-slate-200'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group, index) => (
              <motion.article
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                whileHover={{ y: -6 }}
                className="overflow-hidden rounded-[28px] border border-slate-200  shadow-sm transition-shadow hover:shadow-xl"
              >
                <div className="h-2 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl  text-3xl">
                        {group.emoji}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-950">{group.platform}</h3>
                        <p className="mt-1 text-sm ">{group.category}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {group.verifiedOwner && <Badge tone="emerald">Đã xác minh</Badge>}
                      {group.trustedOwner && <Badge tone="indigo">Chủ nhóm đáng tin cậy</Badge>}
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 ">{group.description}</p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl  p-4">
                      <div className="text-xs ">Trust Score</div>
                      <div className="mt-1 flex items-center gap-2 text-lg font-bold ">
                        {group.trustScore}/100 <Star className="h-4 w-4 text-amber-500" />
                      </div>
                    </div>
                    <div className="rounded-2xl  p-4">
                      <div className="text-xs ">Success Rate</div>
                      <div className="mt-1 text-lg font-bold ">{group.successRate}%</div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-slate-200 p-4 ">
                      <div className="text-xs uppercase tracking-wide text-slate-400">Slots</div>
                      <div className="mt-1 font-semibold ">{group.availableSlots}/{group.totalSlots} available</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-4 ">
                      <div className="text-xs uppercase tracking-wide text-slate-400">Giá / tháng</div>
                      <div className="mt-1 font-semibold ">{formatCurrency(group.price)}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {group.escrowProtected && <Badge tone="sky">Được bảo vệ bởi escrow</Badge>}
                    {group.autoRenewal && <Badge tone="slate">Tự động gia hạn</Badge>}
                    <Badge tone="emerald">Tham gia an toàn</Badge>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedGroup(group)
                      setTermsAccepted(false)
                    }}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Tham gia an toàn <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.article>
            ))
          ) : (
            <div className="md:col-span-2 xl:col-span-3">
              <div className="rounded-[28px] border border-dashed border-slate-300  px-6 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl  text-3xl">🔎</div>
                <h3 className="mt-4 text-xl font-bold text-slate-950">Không tìm thấy nhóm phù hợp</h3>
                <p className="mt-2 text-sm ">Hãy thử từ khóa khác hoặc đổi danh mục để khám phá thêm các nhóm thuê bao đáng tin cậy.</p>
              </div>
            </div>
          )}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[32px] border border-slate-200  p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600"><ShieldCheck className="h-5 w-5" /></div>
              <div>
                <h2 className="text-2xl font-bold text-slate-950">Quy trình bảo vệ bởi escrow</h2>
                <p className="text-sm ">A transparent 4-step flow designed to keep students safe.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {[
                { step: 'Step 1', title: 'Thanh toán được giữ an toàn', icon: CreditCard, desc: 'Your payment stays in escrow while the join request is being processed.' },
                { step: 'Step 2', title: 'Chủ nhóm cung cấp quyền truy cập', icon: Users, desc: 'Verified owners add members and share access details with proof.' },
                { step: 'Step 3', title: 'Thành viên xác nhận', icon: MessageSquareQuote, desc: 'You confirm successful access or raise a dispute if something is wrong.' },
                { step: 'Step 4', title: 'Tiền được giải ngân tự động', icon: Wallet, desc: 'If there is no dispute, the system releases funds safely to the owner.' },
              ].map(({ step, title, icon: Icon, desc }) => (
                <div key={step} className="flex gap-4 rounded-2xl border border-slate-200  p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl  text-indigo-600 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-indigo-600">{step}</div>
                    <div className="mt-1 text-base font-bold text-slate-950">{title}</div>
                    <div className="mt-1 text-sm leading-6 ">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200  p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><CalendarClock className="h-5 w-5" /></div>
              <div>
                <h2 className="text-2xl font-bold text-slate-950">Hoạt động gần đây</h2>
                <p className="text-sm ">Live-style updates from successful joins and escrow events.</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 rounded-2xl border border-slate-200 p-4">
                  <div className={`rounded-2xl p-3 ${activity.type === 'join' ? 'bg-emerald-50 text-emerald-600' : activity.type === 'release' ? 'bg-indigo-50 text-indigo-600' : ' text-sky-600'}`}>
                    {activity.type === 'join' ? <CheckCircle2 className="h-5 w-5" /> : activity.type === 'release' ? <Lock className="h-5 w-5" /> : <BadgeCheck className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-950">{activity.title}</div>
                    <div className="mt-1 text-sm ">{activity.subtitle}</div>
                  </div>
                  <div className="text-xs text-slate-400">{activity.time}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-300  p-5 text-center text-sm ">
              Các cập nhật mới sẽ xuất hiện tại đây khi thành viên tham gia nhóm và các sự kiện escrow hoàn tất.
            </div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {selectedGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
            onClick={() => setSelectedGroup(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-[32px]  p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge tone="emerald">Escrow Protected</Badge>
                  <h3 className="mt-3 text-2xl font-bold text-slate-950">Tham gia an toàn</h3>
                  <p className="mt-1 text-sm ">Xem lại thông tin nhóm trước khi thực hiện thanh toán an toàn.</p>
                </div>
                <button onClick={() => setSelectedGroup(null)} className="rounded-2xl p-2 text-slate-400 transition hover:bg-slate-100 hover:">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 rounded-3xl  p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl  text-3xl shadow-sm">{selectedGroup.emoji}</div>
                  <div>
                    <div className="text-lg font-bold text-slate-950">{selectedGroup.platform}</div>
                    <div className="text-sm ">{selectedGroup.category} • {selectedGroup.availableSlots} slots available</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl  p-4"><div className="">Trust Score</div><div className="mt-1 font-bold text-slate-950">{selectedGroup.trustScore}/100</div></div>
                  <div className="rounded-2xl  p-4"><div className="">Price</div><div className="mt-1 font-bold text-slate-950">{formatCurrency(selectedGroup.price)}</div></div>
                </div>
              </div>

              <div className="mt-5 space-y-3 rounded-3xl border border-slate-200 p-5 text-sm ">
                <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-500" /><span>Your payment will be held securely in escrow until access is confirmed.</span></div>
                <div className="flex items-start gap-3"><Lock className="mt-0.5 h-4 w-4 text-indigo-500" /><span>Only verified group owners can complete the joining workflow.</span></div>
                <div className="flex items-start gap-3"><TrendingUp className="mt-0.5 h-4 w-4 text-sky-500" /><span>Lưu ý pháp lý: việc phối hợp thuê bao dùng chung cần tuân thủ quy định của nền tảng và pháp luật địa phương.</span></div>
              </div>

              <div className="mt-5 rounded-2xl  p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="">Số dư ví</span>
                  <span className="font-semibold text-slate-950">128,000đ</span>
                </div>
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm ">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>I agree to the group terms and understand that funds are released automatically after successful confirmation.</span>
              </label>

              <button
                disabled={!termsAccepted}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Thanh toán an toàn <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
