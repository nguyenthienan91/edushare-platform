import { useEffect, useState, type ComponentType, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  ImageIcon,
  Info,
  Loader2,
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
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/contexts/AuthContext'
import { fetchClient } from '@/utils/fetchClient'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

type EscrowStatus =
  | 'pending'
  | 'held'
  | 'approved_waiting_proof'
  | 'proof'
  | 'completed'
  | 'refunded'
  | 'disputed'
  | 'failed'

interface PopulatedGroup {
  _id: string
  name: string
  category: string
  ownerId: { _id: string; displayName: string; username: string } | string
}

interface Transaction {
  _id: string
  senderId: string
  groupId: PopulatedGroup | string | null
  amount: number
  status: EscrowStatus
  proofUrl: string | null
  expiresAt: string
  createdAt: string
}

interface TransactionsResponse {
  status: string
  list: Transaction[]
  totalPages: number
  totalItems: number
}

// ─── Status map using switch-case ─────────────────────────────────────────────

function getStatusMeta(status: string) {
  switch (status) {
    case 'pending':
    case 'approved_waiting_proof':
      return {
        label: 'Chờ chủ nhóm cấp quyền',
        nextAction: 'Đang xử lý giao dịch thanh toán của bạn.',
        tone: 'bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/10',
        actionIcon: Clock3,
      }
    case 'held':
      return {
        label: 'Chờ chủ nhóm duyệt',
        nextAction: 'Tiền đã được giữ. Đang chờ chủ nhóm phê duyệt yêu cầu tham gia.',
        tone: 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/10',
        actionIcon: Clock3,
      }
    case 'proof':
      return {
        label: 'Chủ nhóm đang xác nhận',
        nextAction: 'Chủ nhóm đã nộp minh chứng. Hãy kiểm tra và xác nhận bạn đã vào nhóm thành công.',
        tone: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 hover:bg-indigo-500/10',
        actionIcon: ShieldCheck,
      }
    case 'completed':
      return {
        label: 'Đã hoàn tất / Đã giải ngân',
        nextAction: 'Giao dịch hoàn tất. Tiền đã được giải ngân cho chủ nhóm.',
        tone: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/10',
        actionIcon: ShieldCheck,
      }
    case 'disputed':
      return {
        label: 'Đang tranh chấp / Đang chờ admin xử lý',
        nextAction: 'Giao dịch đang được tranh chấp. Đang chờ admin xem xét và xử lý.',
        tone: 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/10',
        actionIcon: Info,
      }
    case 'failed':
    case 'refunded':
      return {
        label: 'Đã hoàn tiền về ví',
        nextAction: 'Giao dịch thất bại. Tiền đã được hoàn về ví của bạn.',
        tone: 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/10',
        actionIcon: X,
      }
    default:
      return {
        label: 'Chờ chủ nhóm cấp quyền',
        nextAction: 'Đang xử lý giao dịch thanh toán của bạn.',
        tone: 'bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/10',
        actionIcon: Clock3,
      }
  }
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

function getOwnerName(groupId: PopulatedGroup | string | null) {
  if (!groupId || typeof groupId === 'string') return 'N/A'
  if (typeof groupId.ownerId === 'object' && groupId.ownerId !== null) {
    return groupId.ownerId.displayName || groupId.ownerId.username || 'N/A'
  }
  return 'N/A'
}

function getGroupInfo(groupId: PopulatedGroup | string | null) {
  if (!groupId || typeof groupId === 'string') {
    return { name: 'N/A', category: '', ownerId: null }
  }
  return groupId
}

// ─── Step card ────────────────────────────────────────────────────────────────

function StepCard({ label, done = false, active = false }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <div className='rounded-lg border p-4'>
      <div
        className={
          `mb-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold border ` +
          (done
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            : active
              ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
              : 'bg-secondary text-muted-foreground border-transparent')
        }
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
    case 'failed':
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MemberParticipantOrdersPage() {
  const { user } = useAuth()

  const [orders, setOrders] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Transaction | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [confirmSuccess, setConfirmSuccess] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemPerPage = 10

  // Fetch orders using /transactions/me
  const fetchOrders = async (currentPage = page) => {
    setLoading(true)
    setError(null)
    try {
      const res: TransactionsResponse = await fetchClient(
        `/transactions/me?page=${currentPage}&itemPerPage=${itemPerPage}`
      )
      setOrders(res.list ?? [])
      setTotalPages(res.totalPages ?? 1)
      setTotalItems(res.totalItems ?? 0)
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.userID) {
      fetchOrders()
    }
  }, [user?.userID, page])

  // Confirm transaction (member xác nhận đã nhận được quyền truy cập)
  const handleConfirm = async () => {
    if (!selectedOrder) return
    setConfirming(true)
    try {
      await fetchClient(`/transactions/${selectedOrder._id}/confirm`, { method: 'POST' })
      setConfirmSuccess(true)
      toast.success('Xác nhận đã nhận quyền truy cập thành công')
      
      // Refresh list
      const res: TransactionsResponse = await fetchClient(
        `/transactions/me?page=${page}&itemPerPage=${itemPerPage}`
      )
      setOrders(res.list ?? [])
      setTotalPages(res.totalPages ?? 1)
      setTotalItems(res.totalItems ?? 0)
      const updated = (res.list ?? []).find((t) => t._id === selectedOrder._id)
      if (updated) setSelectedOrder(updated)
    } catch (err: any) {
      toast.error(err.message || 'Xác nhận thất bại.')
    } finally {
      setConfirming(false)
    }
  }

  const activeOrdersCount = useMemo(() => {
    return orders.filter(o => !['completed', 'refunded'].includes(o.status)).length
  }, [orders])

  return (
    <div className='space-y-6'>
      {/* Header */}
      <Card>
        <CardContent className='p-6'>
          <div className='inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100 bg-indigo-50/10'>
            <Sparkles className='h-3.5 w-3.5' />
            Đơn hàng thuê bao an toàn
          </div>
          <h1 className='mt-4 text-3xl font-bold tracking-tight'>Đơn hàng của tôi</h1>
          <p className='mt-2 max-w-2xl text-sm text-muted-foreground'>
            Xem nhanh gói bạn vừa tham gia, trạng thái ký quỹ và bước tiếp theo cần làm.
          </p>
        </CardContent>
      </Card>

      {/* Stats bar */}
      {!loading && (
        <div className='flex flex-wrap items-center gap-3'>
          <Badge variant='outline' className='rounded-full px-4 py-2 text-sm font-semibold'>
            <ShieldCheck className='h-4 w-4 mr-2 text-emerald-600' />
            Đang hoạt động: {activeOrdersCount} gói
          </Badge>
          <Badge variant='outline' className='rounded-full px-4 py-2 text-sm font-semibold'>
            <Clock3 className='h-4 w-4 mr-2 text-sky-600' />
            Tổng: {totalItems} đơn hàng
          </Badge>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className='flex items-center justify-center py-24'>
          <Loader2 className='size-8 animate-spin' />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className='rounded-lg border border-destructive/20 bg-destructive/10 px-5 py-4 text-sm text-destructive'>
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && orders.length === 0 && (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-20 text-center'>
            <FileText className='size-12 text-muted-foreground' />
            <p className='mt-4 font-semibold text-foreground'>Bạn chưa có đơn hàng nào.</p>
            <p className='text-sm text-muted-foreground'>Hãy tham gia nhóm đầu tiên của bạn!</p>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      {!loading && orders.length > 0 && (
        <Card>
          <CardContent >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[180px]'>Mã đơn & Ngày tạo</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead className='text-right'>Giá</TableHead>
                    <TableHead className='text-center w-[180px]'>Trạng thái</TableHead>
                    <TableHead className='text-right w-[150px]'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const meta = getStatusMeta(order.status)
                    const ActionIcon = meta.actionIcon
                    const groupInfo = getGroupInfo(order.groupId)
                    const groupName = groupInfo.name
                    const category = groupInfo.category
                    const ownerName = getOwnerName(order.groupId)

                    return (
                      <TableRow 
                        key={order._id}
                        className='cursor-pointer'
                        onClick={() => {
                          setSelectedOrder(order)
                          setConfirmSuccess(false)
                        }}
                      >
                        <TableCell>
                          <div className='font-mono text-sm font-semibold'>{shortId(order._id)}</div>
                          <div className='mt-1 flex items-center gap-1.5 text-xs text-muted-foreground'>
                            <Clock3 className='h-3.5 w-3.5' />
                            {formatDate(order.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='font-semibold text-base'>{category || 'N/A'}</div>
                          <div className='mt-1 text-xs text-muted-foreground'>
                            Chủ nhóm: {ownerName}
                          </div>
                        </TableCell>
                        <TableCell className='text-right font-semibold text-emerald-600'>
                          {formatVnd(order.amount)}
                        </TableCell>
                        <TableCell className='text-center'>
                          <Badge variant='outline' className={`rounded-full ${meta.tone}`}>
                            {meta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button
                            size='sm'
                            variant='secondary'
                            className='rounded-full inline-flex items-center gap-2'
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedOrder(order)
                              setConfirmSuccess(false)
                            }}
                          >
                            <ActionIcon className='h-4 w-4' />
                            Xem chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
          </CardContent>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-between border-t px-6 py-3'>
              <p className='text-sm text-muted-foreground'>
                Trang {page} / {totalPages} · Tổng {totalItems} đơn hàng
              </p>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  className='rounded-full'
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className='size-4' />
                  Trước
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  className='rounded-full'
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Sau
                  <ChevronRight className='size-4' />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className='sm:max-w-[720px]'>
          {selectedOrder && (() => {
            const meta = getStatusMeta(selectedOrder.status)
            const selectedGroupInfo = getGroupInfo(selectedOrder.groupId)
            const groupName = selectedGroupInfo.name
            const category = selectedGroupInfo.category

            return (
              <>
                <DialogHeader>
                  <DialogTitle className='text-2xl font-bold'>
                    {groupName} · {shortId(selectedOrder._id)}
                  </DialogTitle>
                  <DialogDescription>
                    Gói bạn vừa tham gia đang được theo dõi trong hệ thống ký quỹ.
                  </DialogDescription>
                </DialogHeader>

                <div className='space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2'>
                  {/* Info Grid */}
                  <div className='grid gap-3 rounded-lg border p-4 text-sm sm:grid-cols-2 bg-secondary/20'>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>Mã đơn</span>
                      <span className='font-mono font-semibold'>{shortId(selectedOrder._id)}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>Ngày tạo</span>
                      <span className='font-semibold'>{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>Giá</span>
                      <span className='font-semibold text-emerald-600'>{formatVnd(selectedOrder.amount)}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>Nền tảng</span>
                      <span className='font-semibold'>{groupName}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>Loại</span>
                      <span className='font-semibold text-indigo-600'>{category || 'N/A'}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>Chủ nhóm</span>
                      <span className='font-semibold'>{getOwnerName(selectedOrder.groupId)}</span>
                    </div>
                  </div>

                  {/* Steps Progress */}
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <h4 className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                        Tiến trình đơn hàng
                      </h4>
                      <Badge variant='outline' className={`rounded-full ${meta.tone}`}>
                        {meta.label}
                      </Badge>
                    </div>
                    <div className='grid gap-3 sm:grid-cols-4'>
                      {renderSteps(selectedOrder.status)}
                    </div>
                  </div>

                  {/* Next Action Instruction */}
                  <div className='rounded-lg border p-4 bg-secondary/50'>
                    <div className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                      <Info className='h-4 w-4 text-indigo-500' />
                      Bạn cần làm gì tiếp theo?
                    </div>
                    <p className='text-sm leading-6 text-muted-foreground'>{meta.nextAction}</p>
                  </div>

                  {/* Proof details / Credentials (Tài khoản mật khẩu hoặc link proof) */}
                  {selectedOrder.status === 'completed' && selectedOrder.proofUrl && (
                    <div className='rounded-lg border p-4 bg-emerald-500/5 border-emerald-500/10'>
                      <div className='mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-600'>
                        <ShieldCheck className='h-4 w-4' />
                        Thông tin tài khoản & Mật khẩu
                      </div>
                      <div className='rounded border p-3 font-mono text-sm bg-background break-all select-all'>
                        {selectedOrder.proofUrl}
                      </div>
                      <p className='mt-2 text-xs text-emerald-600'>
                        Vui lòng sử dụng thông tin đăng nhập trên để truy cập gói dịch vụ chia sẻ.
                      </p>
                    </div>
                  )}

                  {/* Standard Proof image (nếu có và trạng thái khác completed) */}
                  {selectedOrder.status !== 'completed' && selectedOrder.proofUrl && (
                    <div className='rounded-lg border p-4'>
                      <div className='mb-3 flex items-center gap-2 text-sm font-semibold'>
                        <ImageIcon className='h-4 w-4 text-indigo-500' />
                        Minh chứng từ chủ nhóm
                      </div>
                      <img
                        src={selectedOrder.proofUrl}
                        alt='Minh chứng cấp quyền'
                        className='w-full rounded-lg border object-contain'
                        style={{ maxHeight: 280 }}
                      />
                    </div>
                  )}
                </div>

                <DialogFooter className='border-t pt-4'>
                  <div className='flex flex-wrap items-center justify-end gap-2 w-full'>
                    {/* Confirm Button – only shown when status = 'proof' */}
                    {selectedOrder.status === 'proof' && !confirmSuccess && (
                      <Button
                        className='rounded-full'
                        onClick={handleConfirm}
                        disabled={confirming}
                      >
                        {confirming ? (
                          <Loader2 className='mr-2 size-4 animate-spin' />
                        ) : (
                          <ShieldCheck className='mr-2 size-4' />
                        )}
                        Xác nhận đã nhận quyền truy cập
                      </Button>
                    )}

                    {confirmSuccess && (
                      <Badge variant='outline' className='rounded-full bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10 px-4 py-2'>
                        ✓ Đã xác nhận! Tiền đang được giải ngân.
                      </Badge>
                    )}

                    <DialogClose asChild>
                      <Button variant='outline' className='rounded-full'>
                        Đóng
                      </Button>
                    </DialogClose>
                  </div>
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
