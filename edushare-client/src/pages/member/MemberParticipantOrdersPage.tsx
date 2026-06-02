import { useEffect, useState, type ComponentType } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import {
  ArrowRight,
  Clock3,
  FileText,
  ImageIcon,
  Info,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { fetchClient } from '@/utils/fetchClient'

// ─── Types ────────────────────────────────────────────────────────────────────

type EscrowStatus =
  | 'pending'
  | 'held'
  | 'approved_waiting_proof'
  | 'proof'
  | 'completed'
  | 'refunded'
  | 'disputed'

interface PopulatedGroup {
  _id: string
  name: string
  category: string
  ownerId: { _id: string; displayName: string; username: string } | string
}

interface Transaction {
  _id: string
  senderId: string
  groupId: PopulatedGroup | null
  amount: number
  status: EscrowStatus
  proofUrl: string | null
  expiresAt: string
  createdAt: string
}

// ─── Status map ───────────────────────────────────────────────────────────────

const STATUS_META: Record<
  EscrowStatus,
  {
    label: string
    nextAction: string
    tone: string
    actionIcon: ComponentType<{ className?: string }>
  }
> = {
  pending: {
    label: 'Chờ thanh toán',
    nextAction: 'Đang xử lý giao dịch thanh toán của bạn.',
    tone: 'bg-slate-100 text-slate-600',
    actionIcon: RefreshCw,
  },
  held: {
    label: 'Chờ chủ nhóm duyệt',
    nextAction: 'Tiền đã được giữ. Đang chờ chủ nhóm phê duyệt yêu cầu tham gia.',
    tone: 'bg-amber-100 text-amber-700',
    actionIcon: Clock3,
  },
  approved_waiting_proof: {
    label: 'Chờ chủ nhóm cấp quyền',
    nextAction: 'Chủ nhóm đã duyệt. Đang chờ chủ nhóm thêm bạn vào gói và nộp minh chứng.',
    tone: 'bg-blue-100 text-blue-700',
    actionIcon: RefreshCw,
  },
  proof: {
    label: 'Chủ nhóm đang xác nhận',
    nextAction: 'Chủ nhóm đã nộp minh chứng. Hãy kiểm tra và xác nhận bạn đã vào nhóm thành công.',
    tone: 'bg-indigo-100 text-indigo-700',
    actionIcon: ShieldCheck,
  },
  completed: {
    label: 'Đã hoàn tất / Đã giải ngân',
    nextAction: 'Giao dịch hoàn tất. Tiền đã được giải ngân cho chủ nhóm.',
    tone: 'bg-emerald-100 text-emerald-700',
    actionIcon: ShieldCheck,
  },
  refunded: {
    label: 'Đã hoàn tiền về ví',
    nextAction: 'Giao dịch thất bại. Tiền đã được hoàn về ví của bạn.',
    tone: 'bg-violet-100 text-violet-700',
    actionIcon: FileText,
  },
  disputed: {
    label: 'Đang tranh chấp / Chờ admin xử lý',
    nextAction: 'Có khiếu nại với đơn hàng này. Admin đang xem xét và xử lý.',
    tone: 'bg-rose-100 text-rose-700',
    actionIcon: Info,
  },
}

function getStatusMeta(status: string) {
  return STATUS_META[status as EscrowStatus] ?? STATUS_META['pending']
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVnd(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function shortId(id: string) {
  return `#${id.slice(-8).toUpperCase()}`
}

function getOwnerName(groupId: PopulatedGroup | null) {
  if (!groupId) return 'N/A'
  if (typeof groupId.ownerId === 'object' && groupId.ownerId !== null) {
    return groupId.ownerId.displayName || groupId.ownerId.username || 'N/A'
  }
  return 'N/A'
}

// ─── Step card ────────────────────────────────────────────────────────────────

function StepCard({ label, done = false, active = false }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <div className='rounded-2xl border border-slate-200 p-4'>
      <div
        className={clsx(
          'mb-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
          done
            ? 'bg-emerald-100 text-emerald-700'
            : active
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-slate-100 text-slate-400',
        )}
      >
        {done ? '✓' : '•'}
      </div>
      <div className='text-sm font-semibold'>{label}</div>
    </div>
  )
}

function renderSteps(status: string) {
  switch (status) {
    case 'completed':
      return (
        <>
          <StepCard label='Tiền được giữ' done />
          <StepCard label='Chủ nhóm duyệt' done />
          <StepCard label='Đã cấp quyền' done />
          <StepCard label='Đã giải ngân' done />
        </>
      )
    case 'refunded':
      return (
        <>
          <StepCard label='Tiền được giữ' done />
          <StepCard label='Chủ nhóm duyệt' done />
          <StepCard label='Đã hoàn tiền' done />
          <StepCard label='Đóng' done />
        </>
      )
    case 'disputed':
      return (
        <>
          <StepCard label='Tiền được giữ' done />
          <StepCard label='Chủ nhóm cấp quyền' done />
          <StepCard label='Đang tranh chấp' active />
          <StepCard label='Chờ admin xử lý' />
        </>
      )
    case 'proof':
      return (
        <>
          <StepCard label='Tiền được giữ' done />
          <StepCard label='Chủ nhóm duyệt' done />
          <StepCard label='Đã nộp minh chứng' active />
          <StepCard label='Xác nhận → Giải ngân' />
        </>
      )
    case 'approved_waiting_proof':
      return (
        <>
          <StepCard label='Tiền được giữ' done />
          <StepCard label='Chủ nhóm duyệt' done />
          <StepCard label='Chờ cấp quyền' active />
          <StepCard label='Giải ngân' />
        </>
      )
    case 'held':
      return (
        <>
          <StepCard label='Tiền được giữ' done />
          <StepCard label='Chờ chủ nhóm duyệt' active />
          <StepCard label='Cấp quyền' />
          <StepCard label='Giải ngân' />
        </>
      )
    default:
      return (
        <>
          <StepCard label='Chờ thanh toán' active />
          <StepCard label='Tiền được giữ' />
          <StepCard label='Chủ nhóm cấp quyền' />
          <StepCard label='Giải ngân' />
        </>
      )
  }
}

// ─── Category icon map ────────────────────────────────────────────────────────

const CATEGORY_ICON: Record<string, string> = {
  'AI Tools': '✨',
  Design: '🎨',
  Productivity: '💼',
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MemberParticipantOrdersPage() {
  const { user } = useAuth()

  const [orders, setOrders] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Transaction | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [confirmSuccess, setConfirmSuccess] = useState(false)

  // Fetch orders
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchClient('/transactions/my-orders')
        // res có thể là mảng hoặc { data: [...] }
        const list: Transaction[] = Array.isArray(res) ? res : (res?.data ?? [])
        setOrders(list)
      } catch (err: any) {
        setError(err.message || 'Không thể tải danh sách đơn hàng.')
      } finally {
        setLoading(false)
      }
    }
    if (user?.userID) load()
  }, [user?.userID])

  // Confirm transaction (member xác nhận đã nhận được quyền truy cập)
  const handleConfirm = async () => {
    if (!selectedOrder) return
    setConfirming(true)
    try {
      await fetchClient(`/transactions/${selectedOrder._id}/confirm`, { method: 'POST' })
      setConfirmSuccess(true)
      // Refresh orders
      const res = await fetchClient('/transactions/my-orders')
      const list: Transaction[] = Array.isArray(res) ? res : (res?.data ?? [])
      setOrders(list)
      // Update selected order
      const updated = list.find((t) => t._id === selectedOrder._id)
      if (updated) setSelectedOrder(updated)
    } catch (err: any) {
      alert(err.message || 'Xác nhận thất bại.')
    } finally {
      setConfirming(false)
    }
  }

  const activeOrders = orders.filter(
    (o) => !['completed', 'refunded'].includes(o.status),
  )

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
      {/* Header */}
      <div className='mb-8'>
        <div className='inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100'>
          <Sparkles className='h-3.5 w-3.5' />
          Đơn hàng thuê bao an toàn
        </div>
        <h1 className='mt-4 text-3xl font-bold tracking-tight sm:text-4xl'>Đơn hàng của tôi</h1>
        <p className='mt-2 max-w-2xl text-sm sm:text-base text-slate-500'>
          Xem nhanh gói bạn vừa tham gia, trạng thái ký quỹ và bước tiếp theo cần làm.
        </p>
      </div>

      {/* Stats bar */}
      {!loading && (
        <div className='mb-6 flex flex-wrap items-center gap-3'>
          <div className='inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold border border-slate-100'>
            <ShieldCheck className='h-4 w-4 text-emerald-600' />
            Đang hoạt động: {activeOrders.length} gói
          </div>
          <div className='inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-sky-700 border border-slate-100'>
            <Clock3 className='h-4 w-4' />
            Tổng: {orders.length} đơn hàng
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className='flex items-center justify-center py-24'>
          <Loader2 className='size-8 animate-spin text-indigo-500' />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className='rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-600'>
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && orders.length === 0 && (
        <div className='flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 py-20'>
          <FileText className='size-12 text-slate-300' />
          <p className='mt-4 text-sm font-medium text-slate-500'>Bạn chưa có đơn hàng nào.</p>
          <p className='mt-1 text-xs text-slate-400'>Hãy tham gia nhóm đầu tiên của bạn!</p>
        </div>
      )}

      {/* Table */}
      {!loading && orders.length > 0 && (
        <div className='overflow-hidden rounded-[28px] border border-slate-100 shadow-sm'>
          <div className='hidden grid-cols-[1.1fr_1.2fr_0.6fr_0.8fr_1fr] gap-4 border-b border-slate-100 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 md:grid'>
            <div>Mã đơn</div>
            <div>Nền tảng</div>
            <div>Giá</div>
            <div>Trạng thái</div>
            <div className='text-right'>Hành động</div>
          </div>

          <div className='divide-y divide-slate-100'>
            {orders.map((order, index) => {
              const meta = getStatusMeta(order.status)
              const ActionIcon = meta.actionIcon
              const groupName = order.groupId?.name ?? 'N/A'
              const category = order.groupId?.category ?? ''
              const icon = CATEGORY_ICON[category] ?? '📦'

              return (
                <motion.button
                  key={order._id}
                  type='button'
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  onClick={() => {
                    setSelectedOrder(order)
                    setConfirmSuccess(false)
                  }}
                  className='grid w-full gap-4 px-5 py-5 text-left transition hover:bg-slate-50/60 md:grid-cols-[1.1fr_1.2fr_0.6fr_0.8fr_1fr] md:items-center md:px-6'
                >
                  {/* Mã đơn + ngày */}
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-100 text-lg'>
                      {icon}
                    </div>
                    <div>
                      <div className='font-mono text-sm font-semibold'>{shortId(order._id)}</div>
                      <div className='mt-1 flex items-center gap-1.5 text-xs text-slate-400'>
                        <Clock3 className='h-3.5 w-3.5' />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Nền tảng */}
                  <div>
                    <div className='text-base font-semibold text-slate-900'>{groupName}</div>
                    <div className='mt-1 text-xs text-slate-400'>
                      {category && <span className='mr-2 font-medium text-indigo-600'>{category}</span>}
                      Chủ nhóm: {getOwnerName(order.groupId)}
                    </div>
                  </div>

                  {/* Giá */}
                  <div className='text-base font-semibold text-emerald-600'>{formatVnd(order.amount)}</div>

                  {/* Trạng thái */}
                  <div>
                    <span
                      className={clsx(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                        meta.tone,
                      )}
                    >
                      {meta.label}
                    </span>
                  </div>

                  {/* Action */}
                  <div className='flex justify-start md:justify-end'>
                    <Button
                      size='sm'
                      className='inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 text-white hover:bg-slate-800'
                    >
                      <ActionIcon className='h-4 w-4' />
                      Xem chi tiết
                      <ArrowRight className='h-4 w-4' />
                    </Button>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className='w-full min-w-[80%] gap-0 p-0 sm:rounded-[28px] [&>button]:hidden'>
          {selectedOrder && (() => {
            const meta = getStatusMeta(selectedOrder.status)
            const groupName = selectedOrder.groupId?.name ?? 'N/A'
            const category = selectedOrder.groupId?.category ?? ''

            return (
              <>
                {/* Header */}
                <div className='flex items-start justify-between gap-4 border-b border-slate-100 p-6'>
                  <div>
                    <div className='inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100'>
                      <FileText className='h-3.5 w-3.5' />
                      Chi tiết đơn
                    </div>
                    <DialogTitle className='mt-3 text-2xl font-bold'>
                      {groupName} · {shortId(selectedOrder._id)}
                    </DialogTitle>
                    <DialogDescription className='mt-1 text-sm'>
                      Gói bạn vừa tham gia đang được theo dõi trong hệ thống ký quỹ.
                    </DialogDescription>
                  </div>
                  <DialogClose className='rounded-2xl p-2 transition hover:bg-slate-100'>
                    <X className='size-5 text-slate-500' />
                  </DialogClose>
                </div>

                <div className='grid gap-6 p-6'>
                  {/* Info grid */}
                  <div className='grid gap-3 rounded-2xl border border-slate-100 p-4 text-sm sm:grid-cols-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-slate-500'>Mã đơn</span>
                      <span className='font-mono font-semibold'>{shortId(selectedOrder._id)}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-slate-500'>Ngày tạo</span>
                      <span className='font-semibold'>{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-slate-500'>Giá</span>
                      <span className='font-semibold text-emerald-600'>{formatVnd(selectedOrder.amount)}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-slate-500'>Nền tảng</span>
                      <span className='font-semibold'>{groupName}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-slate-500'>Loại</span>
                      <span className='font-semibold text-indigo-600'>{category || 'N/A'}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-slate-500'>Chủ nhóm</span>
                      <span className='font-semibold'>{getOwnerName(selectedOrder.groupId)}</span>
                    </div>
                  </div>

                  {/* Progress steps */}
                  <div>
                    <div className='mb-3 flex items-center justify-between'>
                      <h4 className='text-sm font-bold uppercase tracking-wide text-slate-500'>
                        Tiến trình đơn hàng
                      </h4>
                      <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', meta.tone)}>
                        {meta.label}
                      </span>
                    </div>
                    <div className='grid gap-3 sm:grid-cols-4'>{renderSteps(selectedOrder.status)}</div>
                  </div>

                  {/* Next action */}
                  <div className='rounded-2xl border border-slate-200 p-4'>
                    <div className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                      <Info className='h-4 w-4 text-indigo-600' />
                      Bạn cần làm gì tiếp?
                    </div>
                    <p className='text-sm leading-6 text-slate-600'>{meta.nextAction}</p>
                  </div>

                  {/* Proof image (nếu có) */}
                  {selectedOrder.proofUrl && (
                    <div className='rounded-2xl border border-slate-200 p-4'>
                      <div className='mb-3 flex items-center gap-2 text-sm font-semibold'>
                        <ImageIcon className='h-4 w-4 text-indigo-600' />
                        Minh chứng từ chủ nhóm
                      </div>
                      <img
                        src={selectedOrder.proofUrl}
                        alt='Minh chứng cấp quyền'
                        className='w-full rounded-xl border border-slate-100 object-contain'
                        style={{ maxHeight: 320 }}
                      />
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className='flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4'>
                    {/* Confirm button – chỉ hiện khi status = proof */}
                    {selectedOrder.status === 'proof' && !confirmSuccess && (
                      <Button
                        className='rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700'
                        onClick={handleConfirm}
                        disabled={confirming}
                      >
                        {confirming ? (
                          <Loader2 className='mr-2 size-4 animate-spin' />
                        ) : (
                          <ShieldCheck className='mr-2 size-4' />
                        )}
                        Xác nhận đã nhận được quyền truy cập
                      </Button>
                    )}

                    {confirmSuccess && (
                      <span className='rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700'>
                        ✓ Đã xác nhận! Tiền đang được giải ngân.
                      </span>
                    )}

                    <DialogClose asChild>
                      <button
                        type='button'
                        className='inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:border-slate-300'
                      >
                        Đóng
                      </button>
                    </DialogClose>
                  </div>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
