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
  Eye,
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
        badgeVariant: 'secondary' as const,
        actionIcon: Clock3,
      }
    case 'held':
      return {
        label: 'Chờ chủ nhóm duyệt',
        nextAction: 'Tiền đã được giữ. Đang chờ chủ nhóm phê duyệt yêu cầu tham gia.',
        badgeVariant: 'secondary' as const,
        actionIcon: Clock3,
      }
    case 'proof':
      return {
        label: 'Chủ nhóm đang xác nhận',
        nextAction: 'Chủ nhóm đã nộp minh chứng. Hãy kiểm tra và xác nhận bạn đã vào nhóm thành công.',
        badgeVariant: 'secondary' as const,
        actionIcon: ShieldCheck,
      }
    case 'completed':
      return {
        label: 'Đã hoàn tất / Đã giải ngân',
        nextAction: 'Giao dịch hoàn tất. Tiền đã được giải ngân cho chủ nhóm.',
        badgeVariant: 'default' as const,
        actionIcon: ShieldCheck,
      }
    case 'disputed':
      return {
        label: 'Đang tranh chấp / Đang chờ admin xử lý',
        nextAction: 'Giao dịch đang được tranh chấp. Đang chờ admin xem xét và xử lý.',
        badgeVariant: 'destructive' as const,
        actionIcon: Info,
      }
    case 'failed':
    case 'refunded':
      return {
        label: 'Đã hoàn tiền về ví',
        nextAction: 'Giao dịch thất bại. Tiền đã được hoàn về ví của bạn.',
        badgeVariant: 'destructive' as const,
        actionIcon: X,
      }
    default:
      return {
        label: 'Chờ chủ nhóm cấp quyền',
        nextAction: 'Đang xử lý giao dịch thanh toán của bạn.',
        badgeVariant: 'secondary' as const,
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

function getOwnerName(group: PopulatedGroup | null) {
  if (!group) return 'N/A'
  if (typeof group.ownerId === 'object' && group.ownerId !== null) {
    return group.ownerId.displayName || group.ownerId.username || 'N/A'
  }
  return 'N/A'
}

function getGroupInfo(group: PopulatedGroup | null) {
  if (!group) {
    return { name: 'N/A', category: '', ownerId: null }
  }
  return group
}

// ─── Step card ────────────────────────────────────────────────────────────────

function StepCard({ label, done = false, active = false }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <div className='rounded-lg border p-4 bg-card'>
      <div
        className={
          `mb-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ` +
          (done
            ? 'bg-primary text-primary-foreground'
            : active
              ? 'bg-secondary text-secondary-foreground border border-input'
              : 'bg-muted text-muted-foreground')
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
  const [groupsCache, setGroupsCache] = useState<Record<string, PopulatedGroup>>({})
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

  const getResolvedGroup = (groupId: PopulatedGroup | string | null): PopulatedGroup | null => {
    if (!groupId) return null
    if (typeof groupId === 'string') {
      return groupsCache[groupId] || null
    }
    return groupId
  }

  // Fetch orders using /transactions/me
  const fetchOrders = async (currentPage = page) => {
    setLoading(true)
    setError(null)
    try {
      const res: TransactionsResponse = await fetchClient(
        `/transactions/me?page=${currentPage}&itemPerPage=${itemPerPage}`
      )
      const list = res.list ?? []
      setOrders(list)
      setTotalPages(res.totalPages ?? 1)
      setTotalItems(res.totalItems ?? 0)

      // Fetch group details for string groupIds that are not in the cache yet
      const missingGroupIds = Array.from(
        new Set(
          list
            .map((t) => (typeof t.groupId === 'string' ? t.groupId : t.groupId?._id))
            .filter((id): id is string => !!id && !groupsCache[id])
        )
      )

      if (missingGroupIds.length > 0) {
        const groupDetails = await Promise.all(
          missingGroupIds.map(async (id) => {
            try {
              const groupRes = await fetchClient(`/groups/${id}`)
              return { id, data: groupRes }
            } catch {
              return { id, data: null }
            }
          })
        )

        setGroupsCache((prev) => {
          const updated = { ...prev }
          groupDetails.forEach(({ id, data }) => {
            if (data) {
              updated[id] = data
            }
          })
          return updated
        })
      }
      return list
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn hàng.')
      return []
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
      const list = await fetchOrders(page)
      const updated = list.find((t) => t._id === selectedOrder._id)
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
          <Badge variant='secondary' className='inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm'>
            <Sparkles className='h-3.5 w-3.5' />
            Đơn hàng thuê bao an toàn
          </Badge>
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
            <ShieldCheck className='h-4 w-4 mr-2 text-muted-foreground' />
            Đang hoạt động: {activeOrdersCount} gói
          </Badge>
          <Badge variant='outline' className='rounded-full px-4 py-2 text-sm font-semibold'>
            <Clock3 className='h-4 w-4 mr-2 text-muted-foreground' />
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
                    <TableHead className='text-right w-[150px]'>hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const meta = getStatusMeta(order.status)
                    const ActionIcon = meta.actionIcon
                    const resolvedGroup = getResolvedGroup(order.groupId)
                    const groupInfo = getGroupInfo(resolvedGroup)
                    const category = groupInfo.category
                    const ownerName = getOwnerName(resolvedGroup)

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
                        <TableCell className='text-right font-semibold'>
                          {formatVnd(order.amount)}
                        </TableCell>
                        <TableCell className='text-center'>
                          <Badge variant={meta.badgeVariant} className='rounded-full'>
                            {meta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button
                            size='sm'
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedOrder(order)
                              setConfirmSuccess(false)
                            }}
                          >
                            <Eye/>
                            xem chi tiết
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
            const resolvedGroup = getResolvedGroup(selectedOrder.groupId)
            const selectedGroupInfo = getGroupInfo(resolvedGroup)
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
                      <span className='font-semibold'>{formatVnd(selectedOrder.amount)}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>Nền tảng</span>
                      <span className='font-semibold'>{groupName}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>Loại</span>
                      <span className='font-semibold'>{category || 'N/A'}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>Chủ nhóm</span>
                      <span className='font-semibold'>{getOwnerName(resolvedGroup)}</span>
                    </div>
                  </div>

                  {/* Steps Progress */}
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <h4 className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                        Tiến trình đơn hàng
                      </h4>
                      <Badge variant={meta.badgeVariant} className='rounded-full'>
                        {meta.label}
                      </Badge>
                    </div>
                    <div className='grid gap-3 grid-cols-2 sm:grid-cols-4'>
                      {renderSteps(selectedOrder.status)}
                    </div>
                  </div>

                  {/* Next Action Instruction */}
                  <div className='rounded-lg border p-4 bg-muted/20'>
                    <div className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                      <Info className='h-4 w-4 text-muted-foreground' />
                      Bạn cần làm gì tiếp theo?
                    </div>
                    <p className='text-sm leading-6 text-muted-foreground'>{meta.nextAction}</p>
                  </div>

                  {/* Proof details / Credentials (Tài khoản mật khẩu hoặc link proof) */}
                  {selectedOrder.status === 'completed' && selectedOrder.proofUrl && (
                    <div className='rounded-lg border p-4 bg-muted/20'>
                      <div className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                        <ShieldCheck className='h-4 w-4 text-muted-foreground' />
                        Thông tin tài khoản & Mật khẩu
                      </div>
                      <div className='rounded border p-3 font-mono text-sm bg-background break-all select-all'>
                        {selectedOrder.proofUrl}
                      </div>
                      <p className='mt-2 text-xs text-muted-foreground'>
                        Vui lòng sử dụng thông tin đăng nhập trên để truy cập gói dịch vụ chia sẻ.
                      </p>
                    </div>
                  )}

                  {/* Standard Proof image (nếu có và trạng thái khác completed) */}
                  {selectedOrder.status !== 'completed' && selectedOrder.proofUrl && (
                    <div>
  <div className='mb-3 flex items-center gap-2 text-sm font-semibold'>
                        <ImageIcon className='h-4 w-4 text-muted-foreground' />
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
                        variant='default'
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
                      <Badge variant='secondary' className='rounded-full px-4 py-2'>
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

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className='size-2 rounded-full bg-destructive animate-pulse' />
            Khởi tạo khiếu nại giao dịch
          </DialogTitle>
          <DialogDescription>
            Giao dịch sẽ được đóng băng tạm thời. Vui lòng cung cấp lý do chi tiết và hình ảnh bằng chứng để Admin phân xử.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1'>
          <div>
            <Label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
              Lý do khiếu nại (tối thiểu 10 ký tự)
            </Label>
            <textarea
              className='mt-1.5 w-full rounded-xl border p-3 text-sm focus:outline-none dark:bg-slate-950 dark:text-slate-100'
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
            <Label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
              Tệp ảnh minh chứng (tối đa 5 ảnh, bắt buộc có ít nhất 1 ảnh)
            </Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className='mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 transition hover:bg-muted bg-muted/20'
            >
              {previews.length > 0 ? (
                <div className='grid grid-cols-3 gap-2 w-full'>
                  {previews.map((src, i) => (
                    <div key={i} className='relative aspect-square rounded-lg overflow-hidden border'>
                      <img src={src} alt='preview' className='h-full w-full object-cover' />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <ImageIcon className='size-8 text-muted-foreground/50' />
                  <p className='text-xs font-semibold text-muted-foreground'>Nhấn để chọn ảnh bằng chứng</p>
                  <p className='text-[10px] text-muted-foreground/75'>PNG, JPG, JPEG – tối đa 5MB mỗi ảnh</p>
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
            <div className='text-xs text-destructive font-semibold bg-destructive/10 p-2.5 rounded-xl border border-destructive/20 flex items-center gap-2'>
              <CheckCircle2 className='size-4 text-emerald-500' />
              Đã chọn {files.length} ảnh minh chứng
            </div>
          )}

          {error && (
            <p className='rounded-lg bg-destructive/10 p-2 text-sm text-destructive'>{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            variant='destructive'
            onClick={handleSubmit}
            disabled={loading || !files || files.length === 0 || reason.trim().length < 10}
          >
            {loading && <Loader2 className='mr-2 size-3.5 animate-spin' />}
            Gửi yêu cầu khiếu nại
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
