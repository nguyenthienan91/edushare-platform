import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/contexts/AuthContext'
import { fetchClient } from '@/utils/fetchClient'
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BadgeCheck,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface GroupMember {
  _id: string
  email: string
  displayName: string
}

interface Group {
  _id: string
  name: string
  description: string
  category: string
  totalSlots: number
  occupiedSlots: number
  totalPrice: number
  price: number
  status: string
  ownerId: { _id: string; displayName: string; username: string }
  members: GroupMember[]
  expiredAt: string | null
  createdAt: string
}

interface Transaction {
  _id: string
  senderId: { _id: string; email: string; displayName: string } | string
  groupId: string
  amount: number
  status: string
  proofUrl: string | null
  expiresAt: string
  createdAt: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'available', label: 'Đang chờ' },
  { value: 'full', label: 'Đã đủ' },
  { value: 'expired', label: 'Hết hạn' },
  { value: 'closed', label: 'Đã đóng' },
]

const STATUS_BADGE: Record<string, string> = {
  available: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  full: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  expired: 'bg-rose-100 text-rose-700 hover:bg-rose-100',
  closed: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
  hidden: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
}

const STATUS_LABEL: Record<string, string> = {
  available: 'Đang chờ',
  full: 'Đã đủ',
  expired: 'Hết hạn',
  closed: 'Đã đóng',
  hidden: 'Ẩn',
}

const TRANSACTION_STATUS_LABEL: Record<string, string> = {
  held_in_escrow: 'Đang chờ duyệt',
  approved_waiting_proof: 'Đã duyệt – Chờ minh chứng',
  proof_submitted: 'Đã nộp minh chứng',
  completed: 'Hoàn tất',
  refunded: 'Đã hoàn tiền',
  expired: 'Hết hạn',
}

const ITEMS_PER_PAGE = 6

// ─── Confirmation Dialog ──────────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({ open, title, description, loading, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={onCancel} />
      <div className='relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl'>
        <div className='mb-4 flex items-center gap-3'>
          <div className='flex size-10 items-center justify-center rounded-full bg-amber-100'>
            <AlertTriangle className='size-5 text-amber-600' />
          </div>
          <h3 className='text-lg font-semibold text-slate-800'>{title}</h3>
        </div>
        <p className='mb-6 text-sm leading-relaxed text-slate-500'>{description}</p>
        <div className='flex justify-end gap-3'>
          <Button variant='outline' className='rounded-xl' onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
          <Button
            className='rounded-xl bg-rose-600 text-white hover:bg-rose-700'
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className='mr-2 size-4 animate-spin' />}
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Submit Proof Dialog ──────────────────────────────────────────────────────

interface SubmitProofDialogProps {
  open: boolean
  transactionId: string
  onClose: () => void
  onSuccess: () => void
}

function SubmitProofDialog({ open, transactionId, onClose, onSuccess }: SubmitProofDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setError(null)
  }

  const handleSubmit = async () => {
    if (!file) {
      setError('Vui lòng chọn ảnh minh chứng.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await fetchClient(`/transactions/${transactionId}/submit-proof`, {
        method: 'PATCH',
        body: formData,
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Gửi minh chứng thất bại.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreview(null)
    setError(null)
    onClose()
  }

  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={handleClose} />
      <div className='relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl'>
        <div className='mb-1 flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-slate-800'>Nộp minh chứng</h3>
          <button
            onClick={handleClose}
            className='flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100'
          >
            <X className='size-4' />
          </button>
        </div>
        <p className='mb-4 text-sm text-slate-500'>
          Tải lên ảnh chụp màn hình xác nhận bạn đã thêm thành viên vào gói.
        </p>

        <div
          onClick={() => inputRef.current?.click()}
          className='mb-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 px-4 py-8 transition hover:border-indigo-400'
        >
          {preview ? (
            <img src={preview} alt='preview' className='max-h-48 rounded-xl object-contain' />
          ) : (
            <>
              <ImagePlus className='size-10 text-slate-300' />
              <p className='text-sm font-medium text-slate-500'>Nhấn để chọn ảnh</p>
              <p className='text-xs text-slate-400'>PNG, JPG, WEBP – tối đa 5MB</p>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={handleFileChange}
        />

        {file && (
          <div className='mb-3 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600'>
            <CheckCircle2 className='size-4 text-emerald-500' />
            {file.name}
          </div>
        )}

        {error && (
          <p className='mb-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600'>{error}</p>
        )}

        <div className='flex justify-end gap-3'>
          <Button variant='outline' className='rounded-xl' onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            className='rounded-xl bg-indigo-600 text-white hover:bg-indigo-700'
            onClick={handleSubmit}
            disabled={loading || !file}
          >
            {loading && <Loader2 className='mr-2 size-4 animate-spin' />}
            Gửi minh chứng
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Manage Members Dialog ────────────────────────────────────────────────────

interface ManageMembersDialogProps {
  open: boolean
  group: Group | null
  onClose: () => void
  onRefresh: () => void
}

function ManageMembersDialog({ open, group, onClose, onRefresh }: ManageMembersDialogProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTx, setLoadingTx] = useState(false)

  // Confirm states
  const [approveConfirm, setApproveConfirm] = useState<string | null>(null) // transactionId
  const [approvingId, setApprovingId] = useState<string | null>(null)

  // Submit proof
  const [proofTxId, setProofTxId] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (!group) return
    setLoadingTx(true)
    try {
      // Fetch transactions for this group (admin endpoint – owner accessible in this context)
      const res = await fetchClient(`/transactions?groupId=${group._id}`)
      const list: Transaction[] = res?.data ?? res?.transactions ?? []
      setTransactions(list.filter((t: Transaction) => t.groupId === group._id || true))
    } catch {
      setTransactions([])
    } finally {
      setLoadingTx(false)
    }
  }, [group])

  useEffect(() => {
    if (open && group) {
      fetchTransactions()
    }
  }, [open, group, fetchTransactions])

  const handleApprove = async () => {
    if (!approveConfirm) return
    setApprovingId(approveConfirm)
    try {
      await fetchClient(`/transactions/${approveConfirm}/approve`, { method: 'POST' })
      await fetchTransactions()
    } catch (err: any) {
      alert(err.message || 'Duyệt thất bại.')
    } finally {
      setApprovingId(null)
      setApproveConfirm(null)
    }
  }

  if (!open || !group) return null

  const pendingTransactions = transactions.filter(
    (t) => t.status === 'held_in_escrow',
  )
  const approvedTransactions = transactions.filter(
    (t) => t.status === 'approved_waiting_proof',
  )
  const joinedMembers = group.members ?? []

  const getSenderDisplay = (tx: Transaction) => {
    if (typeof tx.senderId === 'object' && tx.senderId !== null) {
      return (tx.senderId as GroupMember).displayName || (tx.senderId as GroupMember).email || 'N/A'
    }
    return String(tx.senderId)
  }
  const getSenderEmail = (tx: Transaction) => {
    if (typeof tx.senderId === 'object' && tx.senderId !== null) {
      return (tx.senderId as GroupMember).email || ''
    }
    return ''
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className='min-w-[90vw] rounded-3xl'>
          <DialogHeader>
            <DialogTitle className='text-2xl'>Manage Members - {group.name}</DialogTitle>
            <DialogDescription>
              Danh sách người dùng đang chờ duyệt và người dùng đã tham gia.
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-6 lg:grid-cols-2'>
            {/* Pending – Approve + Submit Proof */}
            <Card className='rounded-2xl border-slate-200 shadow-sm'>
              <CardHeader className='border-b border-slate-100 pb-3'>
                <CardTitle className='text-base'>Pending</CardTitle>
                <CardDescription>Người dùng đang chờ duyệt.</CardDescription>
              </CardHeader>
              <CardContent className='p-0'>
                {loadingTx ? (
                  <div className='flex justify-center py-8'>
                    <Loader2 className='size-6 animate-spin text-slate-400' />
                  </div>
                ) : pendingTransactions.length === 0 && approvedTransactions.length === 0 ? (
                  <p className='py-6 text-center text-sm text-slate-400'>Không có yêu cầu nào.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className='text-right'>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingTransactions.map((tx) => (
                        <TableRow key={tx._id}>
                          <TableCell className='font-medium'>{getSenderDisplay(tx)}</TableCell>
                          <TableCell>{getSenderEmail(tx)}</TableCell>
                          <TableCell>
                            <div className='flex justify-end gap-2'>
                              <Button
                                size='sm'
                                className='rounded-full bg-emerald-500 text-white hover:bg-emerald-600'
                                disabled={approvingId === tx._id}
                                onClick={() => setApproveConfirm(tx._id)}
                              >
                                {approvingId === tx._id ? (
                                  <Loader2 className='mr-2 size-4 animate-spin' />
                                ) : (
                                  <ShieldCheck className='mr-2 size-4' />
                                )}
                                Approve
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {approvedTransactions.map((tx) => (
                        <TableRow key={tx._id}>
                          <TableCell className='font-medium'>{getSenderDisplay(tx)}</TableCell>
                          <TableCell>{getSenderEmail(tx)}</TableCell>
                          <TableCell>
                            <div className='flex justify-end gap-2'>
                              <Button
                                size='sm'
                                className='rounded-full bg-indigo-600 text-white hover:bg-indigo-700'
                                onClick={() => setProofTxId(tx._id)}
                              >
                                <ImagePlus className='mr-2 size-4' />
                                Submit Proof
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Joined Members */}
            <Card className='rounded-2xl border-slate-200 shadow-sm'>
              <CardHeader className='border-b border-slate-100 pb-3'>
                <CardTitle className='text-base'>Joined</CardTitle>
                <CardDescription>Người dùng đã tham gia nhóm.</CardDescription>
              </CardHeader>
              <CardContent className='p-0'>
                {joinedMembers.length === 0 ? (
                  <p className='py-6 text-center text-sm text-slate-400'>Chưa có thành viên.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className='text-right'>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {joinedMembers.map((member) => (
                        <TableRow key={member._id}>
                          <TableCell className='font-medium'>{member.displayName}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell className='text-right'>
                            <Badge className='rounded-full bg-sky-100 text-sky-700 hover:bg-sky-100'>
                              <BadgeCheck className='mr-1 size-3.5' />
                              Joined
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Approve */}
      <ConfirmDialog
        open={!!approveConfirm}
        title='Phê duyệt thành viên'
        description='Bạn có chắc chắn muốn thêm thành viên này vào nhóm không? Sau khi duyệt, bạn cần nộp minh chứng đã thêm thành viên vào gói.'
        loading={!!approvingId}
        onConfirm={handleApprove}
        onCancel={() => setApproveConfirm(null)}
      />

      {/* Submit Proof */}
      {proofTxId && (
        <SubmitProofDialog
          open={!!proofTxId}
          transactionId={proofTxId}
          onClose={() => setProofTxId(null)}
          onSuccess={() => {
            fetchTransactions()
            onRefresh()
          }}
        />
      )}
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MemberManageGroup() {
  const { user } = useAuth()

  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  // Filters
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priceOrder, setPriceOrder] = useState<'asc' | 'desc' | null>(null)

  // Remove group confirm
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null)
  const [removing, setRemoving] = useState(false)

  // Manage members dialog
  const [managingGroup, setManagingGroup] = useState<Group | null>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  // Reset page when filter/sort changes
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, priceOrder])

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    if (!user?.userID) return
    setLoading(true)
    setError(null)
    try {
      let res: any

      if (priceOrder) {
        // Gọi search với ownerId, rồi sort client-side theo price
        // vì endpoint sort/price không hỗ trợ filter ownerId
        const params = new URLSearchParams()
        params.set('ownerId', user.userID)
        if (debouncedQuery.trim()) params.set('name', debouncedQuery.trim())
        if (statusFilter !== 'all') params.set('status', statusFilter)
        params.set('page', String(currentPage))
        params.set('itemPerPage', String(ITEMS_PER_PAGE))
        res = await fetchClient(`/groups/search?${params.toString()}`)
        // Sort client-side theo price
        if (res?.data) {
          res.data = [...res.data].sort((a: Group, b: Group) =>
            priceOrder === 'asc' ? a.price - b.price : b.price - a.price,
          )
        }
      } else {
        // Search/filter
        const params = new URLSearchParams()
        params.set('ownerId', user.userID)
        if (debouncedQuery.trim()) params.set('name', debouncedQuery.trim())
        if (statusFilter !== 'all') params.set('status', statusFilter)
        params.set('page', String(currentPage))
        params.set('itemPerPage', String(ITEMS_PER_PAGE))
        res = await fetchClient(`/groups/search?${params.toString()}`)
      }

      const data: Group[] = res?.data ?? []
      setGroups(data)
      if (res?.totalPages) setTotalPages(res.totalPages)
      else if (res?.meta?.totalPages) setTotalPages(res.meta.totalPages)
      else setTotalPages(Math.max(1, Math.ceil((res?.totalItems ?? data.length) / ITEMS_PER_PAGE)))
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách nhóm.')
      setGroups([])
    } finally {
      setLoading(false)
    }
  }, [user?.userID, debouncedQuery, statusFilter, priceOrder, currentPage])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  // Remove group
  const handleRemoveGroup = async () => {
    if (!removeConfirm) return
    setRemoving(true)
    try {
      await fetchClient(`/groups/${removeConfirm}`, { method: 'DELETE' })
      setRemoveConfirm(null)
      fetchGroups()
    } catch (err: any) {
      alert(err.message || 'Xóa nhóm thất bại.')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <Card>
        <CardContent>
          <Badge className='rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-100'>
            Manage Group
          </Badge>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight'>Quản lý nhóm của tôi</h2>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-500'>
            Xem nhanh trạng thái từng nhóm, tiến độ lấp đầy slot và các thao tác quan trọng ngay
            dưới card.
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className='p-4 md:p-5'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center'>
            {/* Search */}
            <div className='relative w-full md:max-w-sm'>
              <Search className='pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400' />
              <Input
                id='search-group-input'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Tìm nhóm...'
                className='h-11 rounded-2xl border-slate-200 pl-11'
              />
            </div>

            {/* Status filter */}
            <div className='w-full md:w-52'>
              <Select
                value={statusFilter}
                onValueChange={(val) => setStatusFilter(val)}
              >
                <SelectTrigger
                  id='status-filter-select'
                  className='!h-11 w-full rounded-2xl border-slate-200 px-4'
                >
                  <SelectValue placeholder='Lọc trạng thái' />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort by price button */}
            <Button
              id='sort-price-btn'
              variant='outline'
              className={`h-11 rounded-2xl border-slate-200 px-4 transition-colors ${
                priceOrder
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  : 'hover:border-slate-300'
              }`}
              onClick={() =>
                setPriceOrder((prev) =>
                  prev === null ? 'asc' : prev === 'asc' ? 'desc' : null,
                )
              }
            >
              {priceOrder === 'asc' ? (
                <ArrowUp className='mr-2 size-4 text-indigo-600' />
              ) : priceOrder === 'desc' ? (
                <ArrowDown className='mr-2 size-4 text-indigo-600' />
              ) : (
                <ArrowUpDown className='mr-2 size-4' />
              )}
              Giá{' '}
              {priceOrder === 'asc' ? '↑ Tăng dần' : priceOrder === 'desc' ? '↓ Giảm dần' : 'tiền'}
            </Button>

            {loading && (
              <div className='flex items-center gap-2 text-sm text-slate-400'>
                <Loader2 className='size-4 animate-spin' />
                Đang tải...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className='rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600'>
          {error}
        </div>
      )}

      {/* Groups Grid */}
      {!loading && groups.length === 0 && !error ? (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16'>
          <Users className='size-12 text-slate-300' />
          <p className='mt-3 text-sm font-medium text-slate-500'>Bạn chưa có nhóm nào.</p>
          <p className='mt-1 text-xs text-slate-400'>Hãy tạo nhóm đầu tiên của bạn!</p>
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
          {loading
            ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <Card key={i} className='animate-pulse rounded-2xl'>
                  <CardHeader className='space-y-4'>
                    <div className='h-5 w-2/3 rounded-lg bg-slate-200' />
                    <div className='h-3 w-1/2 rounded-lg bg-slate-100' />
                    <div className='h-2.5 rounded-full bg-slate-100' />
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='h-14 rounded-2xl bg-slate-100' />
                      <div className='h-14 rounded-2xl bg-slate-100' />
                    </div>
                    <div className='h-10 rounded-2xl bg-slate-200' />
                  </CardContent>
                </Card>
              ))
            : groups.map((group) => {
                const progress = Math.round((group.occupiedSlots / group.totalSlots) * 100)
                const statusKey = group.status as string

                return (
                  <Card
                    key={group._id}
                    className='rounded-2xl border-slate-200/70 shadow-sm shadow-sky-100/30 transition hover:shadow-md'
                  >
                    <CardHeader className='space-y-4'>
                      <div className='flex items-start justify-between gap-4'>
                        <div>
                          <CardTitle className='text-xl'>{group.name}</CardTitle>
                          <CardDescription className='mt-1 text-sm'>
                            {group.occupiedSlots}/{group.totalSlots} thành viên
                          </CardDescription>
                        </div>
                        <Badge className={`rounded-full ${STATUS_BADGE[statusKey] ?? 'bg-slate-100 text-slate-600'}`}>
                          {STATUS_LABEL[statusKey] ?? group.status}
                        </Badge>
                      </div>

                      <div className='space-y-2'>
                        <div className='flex items-center justify-between text-sm text-slate-600'>
                          <span>Độ lấp đầy</span>
                          <span className='font-medium'>{progress}%</span>
                        </div>
                        <Progress value={progress} className='h-2.5 bg-slate-100' />
                      </div>
                    </CardHeader>

                    <CardContent className='space-y-4'>
                      <div className='grid grid-cols-2 gap-3 text-sm'>
                        <div className='rounded-2xl border border-slate-100 p-3'>
                          <p className='text-xs text-slate-400'>Slot còn lại</p>
                          <p className='mt-1 font-semibold'>{group.totalSlots - group.occupiedSlots} slot</p>
                        </div>
                        <div className='rounded-2xl border border-slate-100 p-3'>
                          <p className='text-xs text-slate-400'>Giá / slot</p>
                          <p className='mt-1 font-semibold text-indigo-600'>
                            {group.price?.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>

                      {/* Manage Members button */}
                      <Button
                        id={`manage-members-btn-${group._id}`}
                        className='w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800'
                        onClick={() => setManagingGroup(group)}
                      >
                        <Users className='mr-2 size-4' />
                        Manage Members
                      </Button>

                      {/* Action buttons */}
                      <div className='flex flex-wrap gap-2 pt-1'>
                        <Button
                          id={`remove-group-btn-${group._id}`}
                          size='sm'
                          variant='outline'
                          className='rounded-full border-rose-200 text-rose-600 hover:bg-rose-50'
                          onClick={() => setRemoveConfirm(group._id)}
                        >
                          <Trash2 className='mr-2 size-4' />
                          Remove Group
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {/* Prev */}
            <PaginationItem>
              <PaginationPrevious
                href='#'
                text='Trước'
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage > 1) setCurrentPage((p) => p - 1)
                }}
                className={currentPage <= 1 || loading ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {/* Page numbers with ellipsis */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const showPage =
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)

              if (!showPage) {
                if (page === 2 || page === totalPages - 1) {
                  return (
                    <PaginationItem key={`ellipsis-${page}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }
                return null
              }

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href='#'
                    isActive={currentPage === page}
                    onClick={(e) => {
                      e.preventDefault()
                      if (!loading) setCurrentPage(page)
                    }}
                    className={currentPage === page ? 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white' : ''}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            {/* Next */}
            <PaginationItem>
              <PaginationNext
                href='#'
                text='Sau'
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage < totalPages) setCurrentPage((p) => p + 1)
                }}
                className={currentPage >= totalPages || loading ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Remove Group Confirm */}
      <ConfirmDialog
        open={!!removeConfirm}
        title='Xóa nhóm'
        description='Bạn có chắc chắn muốn xóa nhóm này không? Hành động này không thể hoàn tác và toàn bộ dữ liệu nhóm sẽ bị xóa vĩnh viễn.'
        loading={removing}
        onConfirm={handleRemoveGroup}
        onCancel={() => setRemoveConfirm(null)}
      />

      {/* Manage Members Dialog */}
      <ManageMembersDialog
        open={!!managingGroup}
        group={managingGroup}
        onClose={() => setManagingGroup(null)}
        onRefresh={fetchGroups}
      />
    </div>
  )
}
