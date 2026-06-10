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
  Plus,
  Minus,
  Star,
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
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
      return {
        label: 'Chờ thanh toán',
        nextAction: 'Hệ thống đang xử lý yêu cầu thanh toán của bạn.',
        badgeVariant: 'secondary' as const,
        actionIcon: Clock3,
      }
    case 'approved_waiting_proof':
      return {
        label: 'Chờ cấp quyền & minh chứng',
        nextAction: 'Chủ nhóm đã phê duyệt yêu cầu của bạn. Đang chờ chủ nhóm thêm tài khoản của bạn và tải ảnh minh chứng lên.',
        badgeVariant: 'secondary' as const,
        actionIcon: Clock3,
      }
    case 'held':
      return {
        label: 'Chờ chủ nhóm duyệt',
        nextAction: 'Tiền đã được đóng băng trong ví treo hệ thống. Đang chờ chủ nhóm phê duyệt yêu cầu tham gia của bạn.',
        badgeVariant: 'secondary' as const,
        actionIcon: Clock3,
      }
    case 'proof':
      return {
        label: 'Chờ bạn xác nhận',
        nextAction: 'Chủ nhóm đã gửi minh chứng cấp quyền thành công. Vui lòng kiểm tra tài khoản của bạn và bấm "Xác nhận đã nhận quyền truy cập" bên dưới để giải ngân.',
        badgeVariant: 'secondary' as const,
        actionIcon: ShieldCheck,
      }
    case 'completed':
      return {
        label: 'Đã hoàn tất / Đã giải ngân',
        nextAction: 'Đơn hàng hoàn tất. Bạn đã tham gia nhóm thành công và tiền đã được giải ngân cho chủ nhóm.',
        badgeVariant: 'default' as const,
        actionIcon: ShieldCheck,
      }
    case 'disputed':
      return {
        label: 'Đang tranh chấp / Đang chờ admin xử lý',
        nextAction: 'Đơn hàng đang trong trạng thái khiếu nại. Vui lòng đợi Ban quản trị (Admin) kiểm tra và đưa ra phán quyết.',
        badgeVariant: 'destructive' as const,
        actionIcon: Info,
      }
    case 'failed':
    case 'refunded':
      return {
        label: 'Đã hoàn tiền về ví',
        nextAction: 'Giao dịch thất bại. Tiền đóng băng đã được hoàn trả đầy đủ vào ví của bạn.',
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
          <StepCard label='Đã nộp minh chứng' done />
          <StepCard label='Xác nhận → Giải ngân' active />
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
  const [ratedTxIds, setRatedTxIds] = useState<Set<string>>(new Set())
  const [ratingTx, setRatingTx] = useState<Transaction | null>(null)
  const itemPerPage = 10

  const getResolvedGroup = (groupId: PopulatedGroup | string | null): PopulatedGroup | null => {
    if (!groupId) return null
    const id = typeof groupId === 'string' ? groupId : (groupId as any)._id
    return groupsCache[id] || (typeof groupId === 'object' ? (groupId as any) : null)
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

      const missingGroupIds = Array.from(
        new Set(
          list
            .map((t) => (typeof t.groupId === 'string' ? t.groupId : (t.groupId as any)?._id))
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

  const fetchRatedTransactions = async () => {
    try {
      const res = await fetchClient('/ratings/me?type=sent&page=1&itemPerPage=100')
      if (res && res.list) {
        const ids = new Set<string>()
        res.list.forEach((item: any) => {
          let txId = ''
          if (typeof item.transactionId === 'object' && item.transactionId) {
            txId = item.transactionId._id
          } else if (typeof item.transactionId === 'string') {
            txId = item.transactionId
          }
          if (txId) {
            ids.add(txId)
          }
        })
        setRatedTxIds(ids)
      }
    } catch (err) {
      console.error('Failed to fetch rated transactions:', err)
    }
  }

  useEffect(() => {
    if (user?.userID) {
      fetchOrders()
      fetchRatedTransactions()
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

  const renderPaginationItems = () => {
    const items = []
    
    // Button Previous
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          href="#"
          text="Trước"
          onClick={(e) => {
            e.preventDefault()
            if (page > 1) setPage(page - 1)
          }}
          className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
        />
      </PaginationItem>
    )

    // Page Numbers
    const range = 1
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - range && i <= page + range)) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={page === i}
              onClick={(e) => {
                e.preventDefault()
                setPage(i)
              }}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      } else if (i === page - range - 1 || i === page + range + 1) {
        items.push(
          <PaginationItem key={`ellipsis-${i}`}>
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
    }

    // Button Next
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          href="#"
          text="Sau"
          onClick={(e) => {
            e.preventDefault()
            if (page < totalPages) setPage(page + 1)
          }}
          className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
        />
      </PaginationItem>
    )

    return items
  }

  const activeOrdersCount = useMemo(() => {
    return orders.filter(o => !['completed', 'refunded'].includes(o.status)).length
  }, [orders])

  return (
    <div className='space-y-6'>
      {/* Header */}
      <Card>
        <CardContent className='p-6'>
          <Badge variant='secondary' className='inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-semibold'>
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
          <Badge variant='outline' className='rounded-md px-4 py-2 text-sm font-semibold'>
            <ShieldCheck className='h-4 w-4 mr-2 text-muted-foreground' />
            Đang hoạt động: {activeOrdersCount} gói
          </Badge>
          <Badge variant='outline' className='rounded-md px-4 py-2 text-sm font-semibold'>
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
                    <TableHead className='text-right w-[240px]'>hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const meta = getStatusMeta(order.status)
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
                          {(() => {
                            const isBuyer = (typeof order.senderId === 'object' && order.senderId !== null)
                              ? (order.senderId as any)._id === user?.userID
                              : String(order.senderId) === user?.userID
                            return isBuyer ? (
                              <span className='inline-flex items-center text-rose-600 dark:text-rose-400 font-bold'>
                                <Minus className='mr-0.5 size-3.5 shrink-0' />
                                {formatVnd(order.amount)}
                              </span>
                            ) : (
                              <span className='inline-flex items-center text-emerald-600 dark:text-emerald-400 font-bold'>
                                <Plus className='mr-0.5 size-3.5 shrink-0' />
                                {formatVnd(order.amount)}
                              </span>
                            )
                          })()}
                        </TableCell>
                        <TableCell className='text-center'>
                          <Badge variant={meta.badgeVariant} className='rounded-md'>
                            {meta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedOrder(order)
                                setConfirmSuccess(false)
                              }}
                            >
                              <Eye className='mr-1.5 size-4' />
                              xem chi tiết
                            </Button>
                            {(() => {
                              const isBuyer = (typeof order.senderId === 'object' && order.senderId !== null)
                                ? (order.senderId as any)._id === user?.userID
                                : String(order.senderId) === user?.userID
                              const isRated = ratedTxIds.has(order._id)

                              if (order.status === 'completed' && isBuyer) {
                                return isRated ? (
                                  <Button size='sm' variant='ghost' disabled className='text-muted-foreground gap-1.5'>
                                    <Star className='size-4 fill-muted-foreground/30 text-muted-foreground/30' />
                                    Đã đánh giá
                                  </Button>
                                ) : (
                                  <Button
                                    size='sm'
                                    className='bg-amber-500 hover:bg-amber-600 text-white gap-1.5'
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setRatingTx(order)
                                    }}
                                  >
                                    <Star className='size-4 fill-white text-white' />
                                    Đánh giá
                                  </Button>
                                )
                              }
                              return null
                            })()}
                          </div>
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
            <div className='flex flex-col sm:flex-row items-center justify-between border-t px-6 py-4 gap-4'>
              <p className='text-sm text-muted-foreground'>
                Trang {page} / {totalPages} · Tổng {totalItems} đơn hàng
              </p>
              <Pagination className='mx-0 w-auto'>
                <PaginationContent>
                  {renderPaginationItems()}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className='w-[calc(100%-2rem)] sm:max-w-[720px]'>
          {selectedOrder && (() => {
            const meta = getStatusMeta(selectedOrder.status)
            const resolvedGroup = getResolvedGroup(selectedOrder.groupId)
            const selectedGroupInfo = getGroupInfo(resolvedGroup)
            const groupName = selectedGroupInfo.name
            const category = selectedGroupInfo.category
            const isBuyer = (typeof selectedOrder.senderId === 'object' && selectedOrder.senderId !== null)
              ? (selectedOrder.senderId as any)._id === user?.userID
              : String(selectedOrder.senderId) === user?.userID

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
                      {isBuyer ? (
                        <span className='font-semibold flex items-center text-rose-600 dark:text-rose-400'>
                          <Minus className='mr-0.5 size-3.5' />
                          {formatVnd(selectedOrder.amount)}
                        </span>
                      ) : (
                        <span className='font-semibold flex items-center text-emerald-600 dark:text-emerald-400'>
                          <Plus className='mr-0.5 size-3.5' />
                          {formatVnd(selectedOrder.amount)}
                        </span>
                      )}
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
                      <Badge variant={meta.badgeVariant} className='rounded-md'>
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



                  {/* Standard Proof image (nếu có) */}
                  {selectedOrder.proofUrl && (
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
                        className='rounded-md'
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
                        className='rounded-md'
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
                      <Badge variant='secondary' className='rounded-md px-4 py-2 mr-2'>
                        ✓ Đã xác nhận! Tiền đang được giải ngân.
                      </Badge>
                    )}

                    {(selectedOrder.status === 'completed' || confirmSuccess) && isBuyer && (
                      ratedTxIds.has(selectedOrder._id) ? (
                        <Button variant='ghost' disabled className='rounded-md text-muted-foreground gap-1.5'>
                          <Star className='size-4 fill-muted-foreground/30 text-muted-foreground/30' />
                          Đã đánh giá
                        </Button>
                      ) : (
                        <Button
                          className='bg-amber-500 hover:bg-amber-600 text-white rounded-md gap-1.5'
                          onClick={() => {
                            setRatingTx(selectedOrder)
                            setSelectedOrder(null)
                          }}
                        >
                          <Star className='size-4 fill-white text-white' />
                          Đánh giá chủ nhóm
                        </Button>
                      )
                    )}

                    <DialogClose asChild>
                      <Button variant='outline' className='rounded-md'>
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

      {/* Create Rating Dialog */}
      <CreateRatingDialog
        open={!!ratingTx}
        transaction={ratingTx}
        onClose={() => setRatingTx(null)}
        onSuccess={(txId) => {
          setRatedTxIds((prev) => {
            const updated = new Set(prev)
            updated.add(txId)
            return updated
          })
          fetchOrders()
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
              className='mt-1.5 w-full rounded-lg border p-3 text-sm focus:outline-none'
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
              className='mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 transition hover:bg-muted bg-muted/20'
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
            <div className='text-xs text-destructive font-semibold bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 flex items-center gap-2'>
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

interface CreateRatingDialogProps {
  open: boolean
  transaction: Transaction | null
  onClose: () => void
  onSuccess: (txId: string) => void
}

function StarRatingInput({ rating, onChange }: { rating: number; onChange: (r: number) => void }) {
  return (
    <div className='flex gap-2 justify-center py-2'>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type='button'
          onClick={() => onChange(star)}
          className='transition transform hover:scale-110 focus:outline-none'
        >
          <Star
            className={`size-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
          />
        </button>
      ))}
    </div>
  )
}

function CreateRatingDialog({ open, transaction, onClose, onSuccess }: CreateRatingDialogProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!transaction) return
    setLoading(true)
    setError(null)
    try {
      await fetchClient('/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: transaction._id,
          rating,
          comment: comment.trim(),
        }),
      })

      toast.success('Đánh giá chủ nhóm thành công!')
      onSuccess(transaction._id)
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Đánh giá thất bại.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setRating(5)
    setComment('')
    setError(null)
    onClose()
  }

  if (!transaction) return null

  // Resolve group and owner names
  let groupName = 'Nhóm dùng chung'
  let ownerName = 'N/A'

  if (transaction.groupId && typeof transaction.groupId === 'object') {
    groupName = transaction.groupId.name || 'Nhóm dùng chung'
    if (transaction.groupId.ownerId && typeof transaction.groupId.ownerId === 'object') {
      ownerName = (transaction.groupId.ownerId as any).displayName || (transaction.groupId.ownerId as any).username || 'N/A'
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className='size-2 rounded-full bg-amber-500 animate-pulse' />
            Đánh giá chủ nhóm
          </DialogTitle>
          <DialogDescription>
            Đóng góp ý kiến để giúp cải thiện chất lượng dịch vụ của cộng đồng. Đánh giá của bạn sẽ tự động cập nhật điểm uy tín (Trust Score) của chủ nhóm.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='rounded-lg border p-4 bg-muted/20 text-sm space-y-1.5'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Tên nhóm:</span>
              <span className='font-semibold'>{groupName}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Chủ nhóm:</span>
              <span className='font-semibold'>{ownerName}</span>
            </div>
          </div>

          <div className='space-y-2 text-center'>
            <Label className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
              Chọn mức độ hài lòng
            </Label>
            <StarRatingInput rating={rating} onChange={setRating} />
            <div className='text-sm font-semibold text-amber-500'>
              {rating === 5 && 'Rất hài lòng (5/5)'}
              {rating === 4 && 'Hài lòng (4/5)'}
              {rating === 3 && 'Bình thường (3/5)'}
              {rating === 2 && 'Không hài lòng (2/5)'}
              {rating === 1 && 'Rất tệ (1/5)'}
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
              Bình luận / Ý kiến đóng góp (tùy chọn)
            </Label>
            <textarea
              className='mt-1.5 w-full rounded-lg border p-3 text-sm focus:outline-none bg-card focus:border-amber-500 transition-colors'
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder='Nhập ý kiến của bạn về quá trình cấp quyền tài khoản của chủ nhóm...'
            />
          </div>

          {error && (
            <p className='rounded-lg bg-destructive/10 p-2 text-sm text-destructive'>{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            className='bg-amber-500 hover:bg-amber-600 text-white'
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && <Loader2 className='mr-2 size-3.5 animate-spin' />}
            Gửi đánh giá
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
