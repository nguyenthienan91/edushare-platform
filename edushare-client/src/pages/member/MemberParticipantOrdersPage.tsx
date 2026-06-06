import { useEffect, useState, useMemo, useRef } from 'react'
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
  CheckCircle2,
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
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/contexts/AuthContext'
import { fetchClient } from '@/utils/fetchClient'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'

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
  const [disputeTxId, setDisputeTxId] = useState<string | null>(null)
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
          <CardContent>
            <div className='overflow-x-auto scrollbar-thin'>
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
            </div>
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
        <DialogContent className='w-[calc(100%-2rem)] sm:max-w-[720px] rounded-3xl'>
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
                    <div className='grid gap-3 grid-cols-2 sm:grid-cols-4'>
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
                    {selectedOrder.status === 'proof' && !confirmSuccess && (
                      <Button
                        variant='destructive'
                        className='rounded-full'
                        onClick={() => {
                          setDisputeTxId(selectedOrder._id)
                          setSelectedOrder(null)
                        }}
                      >
                        Khiếu nại giao dịch
                      </Button>
                    )}

                    {selectedOrder.status === 'proof' && !confirmSuccess && (
                      <Button
                        className='rounded-full bg-indigo-600 hover:bg-indigo-700 text-white'
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

      {/* Create Dispute Dialog */}
      <CreateDisputeDialog
        open={!!disputeTxId}
        transactionId={disputeTxId}
        onClose={() => setDisputeTxId(null)}
        onSuccess={() => {
          if (user?.userID) fetchOrders()
        }}
      />
    </div>
  )
}

interface CreateDisputeDialogProps {
  open: boolean
  transactionId: string | null
  onClose: () => void
  onSuccess: () => void
}

function CreateDisputeDialog({ open, transactionId, onClose, onSuccess }: CreateDisputeDialogProps) {
  const [reason, setReason] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files
    if (!selected || selected.length === 0) return
    
    if (selected.length > 5) {
      setError('Tối đa chỉ được chọn 5 ảnh bằng chứng.')
      return
    }

    setFiles(selected)
    const previewUrls = Array.from(selected).map((f) => URL.createObjectURL(f))
    setPreviews(previewUrls)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!reason || reason.trim().length < 10) {
      setError('Lý do khiếu nại phải tối thiểu 10 ký tự.')
      return
    }
    if (!files || files.length === 0) {
      setError('Vui lòng chọn ít nhất một hình ảnh minh chứng.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('transactionId', transactionId || '')
      formData.append('reason', reason.trim())
      Array.from(files).forEach((file) => {
        formData.append('files', file)
      })

      await fetchClient('/disputes', {
        method: 'POST',
        body: formData,
      })
      
      toast.success('Gửi đơn khiếu nại thành công! Giao dịch đã được đóng băng để Admin xử lý.')
      onSuccess()
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Gửi khiếu nại thất bại.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setReason('')
    setFiles(null)
    setPreviews([])
    setError(null)
    onClose()
  }

  if (!open || !transactionId) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={handleClose} />
      <div className='relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl mx-4 max-h-[90vh] flex flex-col'>
        <div className='mb-1 flex items-center justify-between shrink-0'>
          <h3 className='text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2'>
            <span className='size-2 rounded-full bg-rose-600 animate-pulse' />
            Khởi tạo khiếu nại giao dịch
          </h3>
          <button
            onClick={handleClose}
            className='flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          >
            <X className='size-4' />
          </button>
        </div>
        <p className='mb-4 text-xs text-muted-foreground shrink-0'>
          Giao dịch sẽ được đóng băng tạm thời. Vui lòng cung cấp lý do chi tiết và hình ảnh bằng chứng để Admin phân xử.
        </p>

        <div className='flex-1 overflow-y-auto pr-1 space-y-4 my-2 scrollbar-thin'>
          <div>
            <Label className='text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
              Lý do khiếu nại (tối thiểu 10 ký tự)
            </Label>
            <textarea
              className='mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 dark:text-slate-100'
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder='Mô tả chi tiết vấn đề bạn gặp phải (ví dụ: Chủ nhóm gửi thông tin tài khoản sai, không đăng nhập được...)'
            />
            <div className='text-[10px] text-right text-muted-foreground mt-1'>
              Đo độ dài: {reason.length} ký tự
            </div>
          </div>

          <div>
            <Label className='text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
              Tệp ảnh minh chứng (tối đa 5 ảnh, bắt buộc có ít nhất 1 ảnh)
            </Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className='mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 px-4 py-6 transition hover:border-rose-400 dark:hover:border-rose-500 bg-slate-50/50 dark:bg-slate-950/20'
            >
              {previews.length > 0 ? (
                <div className='grid grid-cols-3 gap-2 w-full'>
                  {previews.map((src, i) => (
                    <div key={i} className='relative aspect-square rounded-lg overflow-hidden border border-slate-100'>
                      <img src={src} alt='preview' className='h-full w-full object-cover' />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <ImageIcon className='size-8 text-slate-300' />
                  <p className='text-xs font-semibold text-slate-500'>Nhấn để chọn ảnh bằng chứng</p>
                  <p className='text-[10px] text-slate-400'>PNG, JPG, JPEG – tối đa 5MB mỗi ảnh</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              multiple
              className='hidden'
              onChange={handleFileChange}
            />
          </div>

          {files && files.length > 0 && (
            <div className='text-xs text-rose-600 font-semibold bg-rose-50/50 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-100/30 flex items-center gap-2'>
              <CheckCircle2 className='size-4 text-rose-600' />
              Đã chọn {files.length} ảnh minh chứng
            </div>
          )}

          {error && (
            <p className='rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100/30 px-3 py-2 text-xs font-medium text-rose-600'>{error}</p>
          )}
        </div>

        <div className='flex justify-end gap-3 pt-3 border-t shrink-0'>
          <Button variant='outline' className='rounded-xl text-xs font-semibold' onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            className='rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold'
            onClick={handleSubmit}
            disabled={loading || !files || files.length === 0 || reason.trim().length < 10}
          >
            {loading && <Loader2 className='mr-2 size-3.5 animate-spin' />}
            Gửi yêu cầu khiếu nại
          </Button>
        </div>
      </div>
    </div>
  )
}
