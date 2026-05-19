import { useMemo, useState, type ComponentType } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { ArrowRight, Clock3, FileText, Info, RefreshCw, ShieldCheck, Sparkles, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

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
  groupName: string
  icon: string
  price: number
  createdAt: string
  status: OrderStatus
  nextAction: string
  ownerName: string
}

const orders: OrderItem[] = [
  {
    id: '#q43v8lq4g',
    groupName: 'Canva',
    icon: '🎨',
    price: 39000,
    createdAt: '17/05/2026',
    status: 'pending_access',
    nextAction: 'Chờ chủ nhóm cấp quyền',
    ownerName: 'Nguyễn Minh Anh',
  },
  {
    id: '#n92k1p8xa',
    groupName: 'ChatGPT',
    icon: '✨',
    price: 59000,
    createdAt: '16/05/2026',
    status: 'confirmed',
    nextAction: 'Chủ nhóm đang xác nhận',
    ownerName: 'Trần Gia Huy',
  },
  {
    id: '#a71m5c2zq',
    groupName: 'Adobe',
    icon: '🖌️',
    price: 69000,
    createdAt: '14/05/2026',
    status: 'released',
    nextAction: 'Đã giải ngân',
    ownerName: 'Phạm Quốc Bảo',
  },
  {
    id: '#k11t0d9xr',
    groupName: 'Microsoft 365',
    icon: '💼',
    price: 45000,
    createdAt: '12/05/2026',
    status: 'disputed',
    nextAction: 'Đang chờ admin xử lý',
    ownerName: 'Lê Hoàng Long',
  },
  {
    id: '#p88w4z6vn',
    groupName: 'Notion',
    icon: '🗒️',
    price: 29000,
    createdAt: '08/05/2026',
    status: 'refunded',
    nextAction: 'Đã hoàn tiền về ví',
    ownerName: 'Võ Thảo Vy',
  },
]

const statusMeta: Record<
  OrderStatus,
  { label: string; tone: string; actionIcon: ComponentType<{ className?: string }> }
> = {
  pending_payment: { label: 'Chờ thanh toán', tone: 'bg-slate-100 ', actionIcon: RefreshCw },
  confirmed: { label: 'Đã xác nhận', tone: 'bg-blue-100 text-blue-700', actionIcon: RefreshCw },
  pending_access: { label: 'Đã xác nhận', tone: 'bg-blue-100 text-blue-700', actionIcon: RefreshCw },
  released: { label: 'Đã hoàn tất', tone: 'bg-emerald-100 text-emerald-700', actionIcon: ShieldCheck },
  disputed: { label: 'Đang tranh chấp', tone: 'bg-rose-100 text-rose-700', actionIcon: Info },
  refunded: { label: 'Đã hoàn tiền', tone: 'bg-violet-100 text-violet-700', actionIcon: FileText },
  cancelled: { label: 'Đã hủy', tone: 'bg-slate-200 ', actionIcon: X },
}

function formatVnd(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}

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
      <div className='text-sm font-semibold '>{label}</div>
    </div>
  )
}

export default function MemberParticipantOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null)

  const activeOrders = useMemo(
    () => orders.filter((order) => !['released', 'refunded', 'cancelled'].includes(order.status)),
    [],
  )

  return (
    <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
      <div className='mb-8'>
        <div className='inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100'>
          <Sparkles className='h-3.5 w-3.5' />
          Đơn hàng thuê bao an toàn
        </div>
        <h1 className='mt-4 text-3xl font-bold tracking-tight  sm:text-4xl'>Đơn hàng của tôi</h1>
        <p className='mt-2 max-w-2xl text-sm  sm:text-base'>
          Xem nhanh gói bạn vừa tham gia, trạng thái ký quỹ và bước tiếp theo cần làm.
        </p>
      </div>

      <div className='mb-6 flex flex-wrap items-center gap-3'>
        <div className='inline-flex items-center gap-2 rounded-2xl  px-4 py-3 text-sm font-semibold '>
          <ShieldCheck className='h-4 w-4 text-emerald-600' />
          Đang hoạt động: {activeOrders.length} gói
        </div>
        <div className='inline-flex items-center gap-2 rounded-2xl  px-4 py-3 text-sm font-semibold text-sky-700'>
          <Clock3 className='h-4 w-4' />
          Theo dõi escrow và truy cập
        </div>
      </div>

      <div className='overflow-hidden rounded-[28px] border border-slate-100  shadow-sm'>
        <div className='hidden grid-cols-[1.1fr_1.2fr_0.6fr_0.8fr_1fr] gap-4 border-b border-slate-100  px-6 py-4 text-xs font-bold uppercase tracking-wider  md:grid'>
          <div>Mã đơn</div>
          <div>Nền tảng</div>
          <div>Giá</div>
          <div>Trạng thái</div>
          <div className='text-right'>Hành động</div>
        </div>

        <div className='divide-y divide-slate-100'>
          {orders.map((order, index) => {
            const meta = statusMeta[order.status]
            const ActionIcon = meta.actionIcon
            return (
              <motion.button
                key={order.id}
                type='button'
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                onClick={() => setSelectedOrder(order)}
                className='grid w-full gap-4 px-5 py-5 text-left transition hover: md:grid-cols-[1.1fr_1.2fr_0.6fr_0.8fr_1fr] md:items-center md:px-6'
              >
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-2xl  text-lg'>{order.icon}</div>
                  <div>
                    <div className='font-mono text-sm font-semibold '>{order.id}</div>
                    <div className='mt-1 flex items-center gap-2 text-xs '>
                      <Clock3 className='h-3.5 w-3.5' />
                      {order.createdAt}
                    </div>
                  </div>
                </div>

                <div>
                  <div className='text-base font-semibold text-slate-950'>{order.groupName}</div>
                  <div className='mt-1 text-sm '>Chủ nhóm: {order.ownerName}</div>
                </div>

                <div className='text-base font-semibold text-emerald-600'>{formatVnd(order.price)}</div>

                <div>
                  <span
                    className={clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', meta.tone)}
                  >
                    {meta.label}
                  </span>
                  <div className='mt-2 text-sm '>{order.nextAction}</div>
                </div>

                <div className='flex justify-start md:justify-end'>
                  <Button className='inline-flex items-center gap-2 rounded-2xl  px-4 py-2 text-sm font-medium  transition '>
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

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className='w-full min-w-[80%] gap-0 p-0 sm:rounded-[28px] [&>button]:hidden'>
          {selectedOrder && (
            <>
              <div className='flex items-start justify-between gap-4 border-b  p-6'>
                <div>
                  <div className='inline-flex items-center gap-2 rounded-full  px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100'>
                    <FileText className='h-3.5 w-3.5' />
                    Chi tiết đơn
                  </div>
                  <DialogTitle className='mt-3 text-2xl font-bold '>
                    {selectedOrder.groupName} · {selectedOrder.id}
                  </DialogTitle>
                  <DialogDescription className='mt-1 text-sm'>
                    Gói bạn vừa tham gia đang được theo dõi trong hệ thống ký quỹ.
                  </DialogDescription>
                </div>
                <DialogClose className='rounded-2xl p-2  transition hover:bg-slate-100'>
                  <span className='sr-only'>Close</span>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M18 6 6 18' />
                    <path d='m6 6 12 12' />
                  </svg>
                </DialogClose>
              </div>

              <div className='grid gap-6 p-6'>
                <div className='grid gap-3 rounded-2xl  p-4 text-sm sm:grid-cols-2'>
                  <div className='flex items-center justify-between'>
                    <span className=''>Mã đơn</span>
                    <span className='font-semibold '>{selectedOrder.id}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className=''>Ngày tạo</span>
                    <span className='font-semibold '>{selectedOrder.createdAt}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className=''>Giá</span>
                    <span className='font-semibold '>{formatVnd(selectedOrder.price)}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className=''>Chủ nhóm</span>
                    <span className='font-semibold '>{selectedOrder.ownerName}</span>
                  </div>
                </div>

                <div>
                  <div className='mb-3 flex items-center justify-between'>
                    <h4 className='text-sm font-bold uppercase tracking-wide '>Tiến trình đơn hàng</h4>
                    <span
                      className={clsx(
                        'rounded-full px-3 py-1 text-xs font-semibold',
                        statusMeta[selectedOrder.status].tone,
                      )}
                    >
                      {statusMeta[selectedOrder.status].label}
                    </span>
                  </div>
                  <div className='grid gap-3 sm:grid-cols-4'>
                    {selectedOrder.status === 'released' || selectedOrder.status === 'refunded' ? (
                      <>
                        <StepCard label='Tiền được giữ' done />
                        <StepCard label='Chủ nhóm cấp quyền' done />
                        <StepCard label='Bạn xác nhận' done />
                        <StepCard label={selectedOrder.status === 'released' ? 'Đã giải ngân' : 'Đã hoàn tiền'} done />
                      </>
                    ) : selectedOrder.status === 'disputed' ? (
                      <>
                        <StepCard label='Tiền được giữ' done />
                        <StepCard label='Chủ nhóm cấp quyền' done />
                        <StepCard label='Đang tranh chấp' active />
                        <StepCard label='Chờ admin xử lý' />
                      </>
                    ) : selectedOrder.status === 'pending_access' || selectedOrder.status === 'confirmed' ? (
                      <>
                        <StepCard label='Tiền được giữ' done />
                        <StepCard label='Chủ nhóm cấp quyền' done />
                        <StepCard label='Chờ xác nhận truy cập' active />
                        <StepCard label='Giải ngân' />
                      </>
                    ) : (
                      <>
                        <StepCard label='Chờ thanh toán' active />
                        <StepCard label='Tiền được giữ' />
                        <StepCard label='Chủ nhóm cấp quyền' />
                        <StepCard label='Giải ngân' />
                      </>
                    )}
                  </div>
                </div>

                <div className='rounded-2xl border border-slate-200  p-4'>
                  <div className='mb-2 flex items-center gap-2 text-sm font-semibold '>
                    <Info className='h-4 w-4 text-indigo-600' />
                    Bạn cần làm gì tiếp?
                  </div>
                  <p className='text-sm leading-6 '>{selectedOrder.nextAction}</p>
                </div>

                <div className='flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4'>
                  <button
                    type='button'
                    className='inline-flex items-center gap-2 rounded-2xl border border-slate-200  px-4 py-3 text-sm font-semibold  transition hover:border-slate-300'
                  >
                    <FileText className='h-4 w-4' />
                    Xem biên nhận
                  </button>
                  <button
                    type='button'
                    className='inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800'
                  >
                    <ShieldCheck className='h-4 w-4' />
                    Xác minh trạng thái
                  </button>
                  <DialogClose asChild>
                    <button
                      type='button'
                      className='inline-flex items-center gap-2 rounded-2xl border border-slate-200  px-4 py-3 text-sm font-semibold  transition hover:border-slate-300'
                    >
                      Đóng
                    </button>
                  </DialogClose>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
