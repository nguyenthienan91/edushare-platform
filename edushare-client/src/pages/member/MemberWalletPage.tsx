import { useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  ReceiptText,
  ShieldCheck,
  Wallet as WalletIcon,
  X,
} from 'lucide-react'

type OrderStatus = 'confirmed' | 'pending_access' | 'released' | 'disputed' | 'refunded'

type Order = {
  id: string
  platform: string
  participantId: string
  ownerId: string
  price: number
  status: OrderStatus
  createdAt: string
}

type OrderStep = {
  label: string
  done: boolean
}

const statusLabel: Record<OrderStatus, string> = {
  confirmed: 'Đã xác nhận',
  pending_access: 'Chờ truy cập',
  released: 'Đã giải ngân',
  disputed: 'Đang tranh chấp',
  refunded: 'Đã hoàn tiền',
}

const statusTone: Record<OrderStatus, string> = {
  confirmed: 'bg-blue-100 text-blue-700',
  pending_access: 'bg-amber-100 text-amber-700',
  released: 'bg-emerald-100 text-emerald-700',
  disputed: 'bg-rose-100 text-rose-700',
  refunded: 'bg-violet-100 text-violet-700',
}

const orderSteps: Record<OrderStatus, OrderStep[]> = {
  confirmed: [
    { label: 'Tiền được giữ', done: true },
    { label: 'Chủ nhóm xác nhận', done: true },
    { label: 'Chờ thêm quyền truy cập', done: true },
    { label: 'Giải ngân', done: false },
  ],
  pending_access: [
    { label: 'Tiền được giữ', done: true },
    { label: 'Chủ nhóm xác nhận', done: true },
    { label: 'Chờ thêm quyền truy cập', done: false },
    { label: 'Giải ngân', done: false },
  ],
  released: [
    { label: 'Tiền được giữ', done: true },
    { label: 'Chủ nhóm xác nhận', done: true },
    { label: 'Chờ thêm quyền truy cập', done: true },
    { label: 'Giải ngân', done: true },
  ],
  disputed: [
    { label: 'Tiền được giữ', done: true },
    { label: 'Chủ nhóm xác nhận', done: true },
    { label: 'Chờ thêm quyền truy cập', done: false },
    { label: 'Giải ngân', done: false },
  ],
  refunded: [
    { label: 'Tiền được giữ', done: true },
    { label: 'Chủ nhóm xác nhận', done: true },
    { label: 'Chờ thêm quyền truy cập', done: false },
    { label: 'Hoàn tiền', done: true },
  ],
}

const receiptNotes: Record<OrderStatus, string> = {
  confirmed: 'Giao dịch đang chờ bạn xác nhận quyền truy cập.',
  pending_access: 'Hệ thống đang giữ tiền cho đến khi truy cập được xác nhận.',
  released: 'Tiền đã được giải ngân cho chủ nhóm.',
  disputed: 'Giao dịch đang bị đóng băng để xử lý khiếu nại.',
  refunded: 'Giao dịch đã hoàn tiền về ví của bạn.',
}

export default function MemberWalletPage() {
  const currentUser = {
    id: 'user_1',
    name: 'Bạn',
    walletBalance: 120500,
  }

  const [orders] = useState<Order[]>([
    { id: 'ORD001', platform: 'Canva', participantId: 'user_1', ownerId: 'owner_1', price: 39000, status: 'confirmed', createdAt: '2025-09-12' },
    { id: 'ORD002', platform: 'ChatGPT', participantId: 'owner_2', ownerId: 'user_1', price: 59000, status: 'pending_access', createdAt: '2025-09-10' },
    { id: 'ORD003', platform: 'Adobe', participantId: 'user_1', ownerId: 'owner_3', price: 69000, status: 'released', createdAt: '2025-09-07' },
    { id: 'ORD004', platform: 'Microsoft 365', participantId: 'user_1', ownerId: 'owner_4', price: 32000, status: 'disputed', createdAt: '2025-09-05' },
    { id: 'ORD005', platform: 'Notion', participantId: 'owner_5', ownerId: 'user_1', price: 29000, status: 'refunded', createdAt: '2025-09-01' },
    { id: 'ORD006', platform: 'Figma', participantId: 'user_1', ownerId: 'owner_6', price: 32000, status: 'confirmed', createdAt: '2025-08-29' },
  ])

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const myEscrowOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          (order.ownerId === currentUser.id || order.participantId === currentUser.id) &&
          (order.status === 'confirmed' || order.status === 'pending_access' || order.status === 'disputed')
      ),
    [orders, currentUser.id]
  )

  const totalEscrow = myEscrowOrders.reduce((sum, order) => sum + order.price, 0)
  const formatVnd = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`

  const activeOrder = selectedOrder ?? orders[0]
  const selectedSteps = orderSteps[activeOrder.status]

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <WalletIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ví ký quỹ</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý số dư và tiền đang giữ cho các nhóm thuê bao EduShare.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-sm">
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="mb-2 text-sm text-slate-400">Số dư khả dụng</div>
            <div className="mb-8 text-4xl font-extrabold">{formatVnd(currentUser.walletBalance)}</div>
            <div className="flex gap-3">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                <ArrowDownLeft className="h-4 w-4" />
                Nạp tiền
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/20">
                <ArrowUpRight className="h-4 w-4" />
                Rút tiền
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Tiền đang giữ trong ký quỹ
            </div>
            <div className="mb-2 text-4xl font-extrabold text-slate-900">{formatVnd(totalEscrow)}</div>
            <p className="text-sm leading-6 text-slate-500">
              Khoản này đang được giữ an toàn cho các giao dịch subscription sharing và sẽ được giải ngân khi hoàn tất xác nhận.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6 text-sm">
            <span className="text-slate-500">Giao dịch chờ xử lý</span>
            <span className="font-semibold text-slate-900">{myEscrowOrders.length} giao dịch</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
          <Clock className="h-5 w-5 text-slate-400" />
          Lịch sử giao dịch
        </h2>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {orders.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {orders.map((order) => {
                const isOutgoing = order.participantId === currentUser.id
                const isSelected = selectedOrder?.id === order.id
                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full p-4 text-left transition hover:bg-slate-50 ${isSelected ? 'bg-slate-50' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isOutgoing ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {isOutgoing ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-slate-900">
                            {isOutgoing ? `Thanh toán nhóm ${order.platform}` : `Tiền vào ví từ nhóm ${order.platform}`}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span className={`rounded-full px-2 py-0.5 font-semibold ${statusTone[order.status]}`}>{statusLabel[order.status]}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`shrink-0 font-bold ${isOutgoing ? 'text-slate-900' : 'text-emerald-600'}`}>
                        {isOutgoing ? '-' : '+'}{formatVnd(order.price)}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">Chưa có giao dịch nào</div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                  <Eye className="h-3.5 w-3.5" />
                  Chi tiết giao dịch
                </div>
                <h3 className="mt-3 text-2xl font-bold text-slate-950">{selectedOrder.platform} · {selectedOrder.id}</h3>
                <p className="mt-1 text-sm text-slate-500">{receiptNotes[selectedOrder.status]}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-2xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 p-6">
              <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                <div className="flex items-center justify-between"><span className="text-slate-500">Mã giao dịch</span><span className="font-semibold text-slate-900">{selectedOrder.id}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-500">Ngày tạo</span><span className="font-semibold text-slate-900">{new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-500">Số tiền</span><span className="font-semibold text-slate-900">{formatVnd(selectedOrder.price)}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-500">Trạng thái</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[selectedOrder.status]}`}>{statusLabel[selectedOrder.status]}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-500">Vai trò</span><span className="font-semibold text-slate-900">{selectedOrder.participantId === currentUser.id ? 'Người tham gia' : 'Chủ nhóm'}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-500">Loại ví</span><span className="font-semibold text-slate-900">Ký quỹ EduShare</span></div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">Tiến trình giao dịch</h4>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[selectedOrder.status]}`}>{statusLabel[selectedOrder.status]}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  {selectedSteps.map((step, index) => (
                    <div key={step.label} className="rounded-2xl border border-slate-200 p-4">
                      <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full ${step.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="text-sm font-semibold text-slate-900">Bước {index + 1}</div>
                      <div className="mt-1 text-sm text-slate-500">{step.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <ReceiptText className="h-4 w-4 text-indigo-600" />
                  Biên nhận nhanh
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  {selectedOrder.platform} · {statusLabel[selectedOrder.status]} · {formatVnd(selectedOrder.price)}
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                >
                  <Download className="h-4 w-4" />
                  Tải hóa đơn
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <FileText className="h-4 w-4" />
                  Xem biên nhận
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
