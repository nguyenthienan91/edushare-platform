import { useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileText,
  HelpCircle,
  Lock,
  MessageSquareWarning,
  ShieldCheck,
  Sparkles,
  Upload,
  Wallet,
  X,
} from 'lucide-react'

type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'pending_access'
  | 'released'
  | 'disputed'
  | 'refunded'
  | 'cancelled'

type OrderItem = {
  id: string
  platformName: string
  platformEmoji: string
  orderCode: string
  price: number
  createdAt: string
  escrowStatus: string
  trustProtected: boolean
  workflowState: OrderStatus
  ownerName: string
  ownerTrustScore: number
  category: 'Productivity' | 'Design' | 'AI Tools' | 'Entertainment'
  notes: string
}

type BadgeTone = 'indigo' | 'sky' | 'emerald' | 'amber' | 'rose' | 'slate'

type StatCardProps = {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  accent: 'indigo' | 'sky' | 'emerald' | 'slate'
}

const orders: OrderItem[] = [
  { id: '1', platformName: 'Canva', platformEmoji: '🎨', orderCode: 'EDU-CAN-24019', price: 39000, createdAt: '12/09/2025', escrowStatus: 'Đang giữ tiền an toàn', trustProtected: true, workflowState: 'pending_access', ownerName: 'Nguyễn Minh Anh', ownerTrustScore: 98, category: 'Design', notes: 'Nhóm thiết kế đã xác minh, thanh toán đang nằm trong escrow.' },
  { id: '2', platformName: 'ChatGPT', platformEmoji: '✨', orderCode: 'EDU-GPT-24082', price: 59000, createdAt: '10/09/2025', escrowStatus: 'Đã xác nhận', trustProtected: true, workflowState: 'confirmed', ownerName: 'Trần Gia Huy', ownerTrustScore: 96, category: 'AI Tools', notes: 'Chủ nhóm phản hồi nhanh, phù hợp cho học tập và nghiên cứu.' },
  { id: '3', platformName: 'Adobe', platformEmoji: '🖌️', orderCode: 'EDU-ADB-23910', price: 69000, createdAt: '07/09/2025', escrowStatus: 'Đã giải ngân', trustProtected: true, workflowState: 'released', ownerName: 'Phạm Quốc Bảo', ownerTrustScore: 94, category: 'Design', notes: 'Giao dịch đã hoàn tất, tiền được giải ngân tự động.' },
  { id: '4', platformName: 'Microsoft 365', platformEmoji: '💼', orderCode: 'EDU-MS-24811', price: 45000, createdAt: '05/09/2025', escrowStatus: 'Đang tranh chấp', trustProtected: true, workflowState: 'disputed', ownerName: 'Lê Hoàng Long', ownerTrustScore: 89, category: 'Productivity', notes: 'Thanh toán bị đóng băng để chờ admin xử lý khiếu nại.' },
  { id: '5', platformName: 'Notion', platformEmoji: '🗒️', orderCode: 'EDU-NOT-24061', price: 69000, createdAt: '01/09/2025', escrowStatus: 'Đã hoàn tiền', trustProtected: true, workflowState: 'refunded', ownerName: 'Võ Thảo Vy', ownerTrustScore: 97, category: 'Productivity', notes: 'Nhóm không hoàn tất đúng cam kết nên hệ thống đã xử lý hoàn tiền.' },
  { id: '6', platformName: 'Figma', platformEmoji: '🧩', orderCode: 'EDU-FIG-24671', price: 32000, createdAt: '29/08/2025', escrowStatus: 'Đã hủy', trustProtected: false, workflowState: 'cancelled', ownerName: 'Nguyễn Nhật Nam', ownerTrustScore: 91, category: 'Design', notes: 'Bạn chưa hoàn tất bước thanh toán nên đơn không được tạo.' },
]

const stats = [
  { label: 'Tổng đơn hàng', value: '06', icon: FileText, accent: 'indigo' as const },
  { label: 'Đơn đang chờ xác nhận', value: '02', icon: Clock3, accent: 'sky' as const },
  { label: 'Đơn đã hoàn tất', value: '02', icon: CheckCircle2, accent: 'emerald' as const },
  { label: 'Đơn đang tranh chấp', value: '01', icon: AlertTriangle, accent: 'slate' as const },
]

const statusMeta: Record<OrderStatus, { label: string; tone: BadgeTone; icon: React.ComponentType<{ className?: string }> }> = {
  pending_payment: { label: 'Chờ thanh toán', tone: 'amber', icon: Wallet },
  confirmed: { label: 'Đã xác nhận', tone: 'emerald', icon: CheckCircle2 },
  pending_access: { label: 'Chờ cấp quyền', tone: 'sky', icon: Lock },
  released: { label: 'Đã giải ngân', tone: 'emerald', icon: BadgeCheck },
  disputed: { label: 'Đang tranh chấp', tone: 'rose', icon: MessageSquareWarning },
  refunded: { label: 'Đã hoàn tiền', tone: 'indigo', icon: CircleAlert },
  cancelled: { label: 'Đã hủy', tone: 'slate', icon: X },
}

const workflowSteps = ['Tiền đã giữ', 'Chủ nhóm thêm quyền', 'Thành viên xác nhận', 'Escrow giải ngân'] as const

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}

function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: BadgeTone }) {
  const tones: Record<BadgeTone, string> = {
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  }

  return <span className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1', tones[tone])}>{children}</span>
}

function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  const bg = {
    indigo: 'from-indigo-500/10 to-indigo-50',
    sky: 'from-sky-500/10 to-sky-50',
    emerald: 'from-emerald-500/10 to-emerald-50',
    slate: 'from-slate-500/10 to-slate-50',
  }

  return (
    <motion.div whileHover={{ y: -4 }} className={clsx('rounded-2xl border border-slate-100 bg-gradient-to-br p-5 shadow-sm', bg[accent])}>
      <div className={clsx('mb-4 inline-flex rounded-2xl bg-white p-3 shadow-sm', accent === 'indigo' && 'text-indigo-600', accent === 'sky' && 'text-sky-600', accent === 'emerald' && 'text-emerald-600', accent === 'slate' && 'text-slate-600')}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-bold text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </motion.div>
  )
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = statusMeta[status]
  const Icon = meta.icon
  return (
    <Badge tone={meta.tone}>
      <span className="mr-1 inline-flex items-center"><Icon className="h-3.5 w-3.5" /></span>
      {meta.label}
    </Badge>
  )
}

function WorkflowProgress({ currentStatus }: { currentStatus: OrderStatus }) {
  const currentIndex = currentStatus === 'pending_payment' ? 0 : currentStatus === 'pending_access' ? 1 : currentStatus === 'confirmed' ? 2 : 3
  return (
    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Quy trình</span>
        <span>{statusMeta[currentStatus].label}</span>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {workflowSteps.map((step, index) => {
          const active = index <= currentIndex
          return (
            <div key={step} className="space-y-2 text-center">
              <div className={clsx('mx-auto h-2 rounded-full', active ? 'bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500' : 'bg-slate-200')} />
              <div className={clsx('text-[11px] font-medium leading-4', active ? 'text-slate-900' : 'text-slate-400')}>{step}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OrderActions({ order, onOpenDispute }: { order: OrderItem; onOpenDispute: (order: OrderItem) => void }) {
  const canConfirm = order.workflowState === 'pending_access'
  const canDispute = ['pending_access', 'confirmed', 'pending_payment'].includes(order.workflowState)

  return (
    <div className="flex flex-wrap gap-2">
      <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-700">
        Xem chi tiết <ChevronRight className="h-4 w-4" />
      </button>
      {canConfirm && (
        <button className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-500">
          Xác nhận truy cập <BadgeCheck className="h-4 w-4" />
        </button>
      )}
      {canDispute && (
        <button onClick={() => onOpenDispute(order)} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100">
          Mở tranh chấp <MessageSquareWarning className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-50 text-4xl">📦</div>
      <h3 className="mt-5 text-2xl font-bold text-slate-950">Bạn chưa có đơn hàng nào</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">Hãy khám phá các nhóm thuê bao đã xác minh để tham gia với thanh toán được bảo vệ bởi escrow và chủ nhóm đáng tin cậy.</p>
      <button className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5 hover:bg-indigo-500">
        Khám phá nhóm <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function MemberParticipantOrdersPage() {
  const [selectedDisputeOrder, setSelectedDisputeOrder] = useState<OrderItem | null>(null)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeDetails, setDisputeDetails] = useState('')
  const [hasOrders] = useState(true)

  const activeOrders = useMemo(() => orders.filter((order) => !['released', 'refunded', 'cancelled'].includes(order.workflowState)), [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                <Sparkles className="h-3.5 w-3.5" />
                Quản lý thuê bao an toàn
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Đơn hàng của tôi</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Theo dõi trạng thái escrow, tiến trình tham gia nhóm thuê bao và các cập nhật từ chủ nhóm đáng tin cậy.</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  <Wallet className="h-4 w-4 text-indigo-600" />
                  Đơn đang hoạt động: {activeOrders.length}
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                  Escrow bảo vệ giao dịch
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
        </section>

        {hasOrders ? (
          <section className="mt-8 rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">Danh sách đơn hàng</h2>
                <p className="mt-1 text-sm text-slate-500">Giao diện gọn hơn để theo dõi nhanh trạng thái của từng đơn.</p>
              </div>
              <div className="hidden items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 text-sm text-slate-600 sm:inline-flex">
                <HelpCircle className="h-4 w-4 text-indigo-600" />
                Cập nhật hôm nay
              </div>
            </div>

            <div className="grid gap-4">
              {orders.map((order, index) => (
                <motion.article key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.04 }} whileHover={{ y: -3 }} className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-2xl">{order.platformEmoji}</div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-950">{order.platformName}</h3>
                          <Badge tone="emerald">Nhóm thuê bao</Badge>
                          {order.trustProtected && <Badge tone="sky">Được bảo vệ</Badge>}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{order.orderCode} • {order.createdAt}</p>
                        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{order.notes}</p>
                      </div>
                    </div>
                    <div className="hidden sm:block"><StatusBadge status={order.workflowState} /></div>
                  </div>

                  <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                    <div className="flex items-center justify-between"><span className="text-slate-500">Giá</span><span className="font-semibold text-slate-950">{formatCurrency(order.price)}</span></div>
                    <div className="flex items-center justify-between"><span className="text-slate-500">Escrow</span><Badge tone="emerald">{order.escrowStatus}</Badge></div>
                    <div className="flex items-center justify-between"><span className="text-slate-500">Chủ nhóm</span><span className="font-semibold text-slate-950">{order.ownerName}</span></div>
                    <div className="flex items-center justify-between"><span className="text-slate-500">Uy tín chủ nhóm</span><span className="font-semibold text-slate-950">{order.ownerTrustScore}/100</span></div>
                  </div>

                  <div className="mt-4 sm:hidden"><StatusBadge status={order.workflowState} /></div>
                  <WorkflowProgress currentStatus={order.workflowState} />
                  <div className="mt-4"><OrderActions order={order} onOpenDispute={setSelectedDisputeOrder} /></div>
                </motion.article>
              ))}
            </div>
          </section>
        ) : (
          <section className="mt-8"><EmptyState /></section>
        )}
      </div>

      <AnimatePresence>
        {selectedDisputeOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-md" onClick={() => setSelectedDisputeOrder(null)}>
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">
                    <MessageSquareWarning className="h-3.5 w-3.5" />
                    Mở tranh chấp
                  </div>
                  <h3 className="mt-3 text-2xl font-bold text-slate-950">Báo cáo vấn đề cho đơn {selectedDisputeOrder.orderCode}</h3>
                  <p className="mt-1 text-sm text-slate-500">Escrow sẽ tạm đóng băng cho đến khi tranh chấp được xử lý xong.</p>
                </div>
                <button onClick={() => setSelectedDisputeOrder(null)} className="rounded-2xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 rounded-3xl bg-slate-50 p-5">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <Badge tone="emerald">Được bảo vệ bởi escrow</Badge>
                  <Badge tone="indigo">Chủ nhóm uy tín: {selectedDisputeOrder.ownerTrustScore}/100</Badge>
                  <Badge tone="sky">Nhóm thuê bao: {selectedDisputeOrder.platformName}</Badge>
                </div>
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>Thông báo: escrow sẽ tạm dừng giải ngân trong quá trình xử lý tranh chấp để đảm bảo an toàn cho cả hai bên.</span>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">Lý do tranh chấp</span>
                  <select value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-300">
                    <option value="">Chọn lý do</option>
                    <option value="Chưa được thêm vào nhóm">Chưa được thêm vào nhóm</option>
                    <option value="Quyền truy cập không hoạt động">Quyền truy cập không hoạt động</option>
                    <option value="Bị yêu cầu thanh toán thêm">Bị yêu cầu thanh toán thêm</option>
                    <option value="Lý do khác">Lý do khác</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">Mô tả chi tiết</span>
                  <textarea
                    value={disputeDetails}
                    onChange={(e) => setDisputeDetails(e.target.value)}
                    rows={4}
                    placeholder="Mô tả rõ tình huống, thời gian và những gì bạn đã thử thực hiện..."
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-300"
                  />
                </label>

                <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition hover:border-indigo-200 hover:bg-indigo-50/40">
                  <Upload className="mx-auto h-10 w-10 text-indigo-600" />
                  <p className="mt-3 text-sm font-semibold text-slate-800">Khu vực tải lên minh chứng</p>
                  <p className="mt-1 text-sm text-slate-500">Kéo thả ảnh chụp màn hình hoặc tệp minh chứng vào đây.</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                <div className="flex items-start gap-3">
                  <Lock className="mt-0.5 h-4 w-4" />
                  <span>Escrow sẽ bị đóng băng tạm thời cho đến khi tranh chấp được xử lý xong.</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button onClick={() => setSelectedDisputeOrder(null)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300">
                  Hủy <X className="h-4 w-4" />
                </button>
                <button className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-rose-500">
                  Gửi tranh chấp <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
