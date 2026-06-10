import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
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
  Lock,
  Search,
  ShieldCheck,
  Trash2,
  Users,
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
  { value: 'available', label: 'Có sẵn' },
  { value: 'full', label: 'Đã đủ' },
  { value: 'expired', label: 'Hết hạn' },
  { value: 'closed', label: 'Đã đóng' },
]

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  available: 'secondary',
  full: 'default',
  expired: 'destructive',
  closed: 'outline',
  hidden: 'outline',
}

const STATUS_LABEL: Record<string, string> = {
  available: 'Có sẵn',
  full: 'Đã đủ',
  expired: 'Hết hạn',
  closed: 'Đã đóng',
  hidden: 'Ẩn',
}

// TRANSACTION_STATUS_LABEL removed because it is unused

const ITEMS_PER_PAGE = 6

// ─── Confirmation Dialog ──────────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  loading?: boolean
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({ open, title, description, loading, confirmVariant = 'default', onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nộp minh chứng</DialogTitle>
          <DialogDescription>
            Tải lên ảnh chụp màn hình xác nhận bạn đã thêm thành viên vào gói.
          </DialogDescription>
        </DialogHeader>

        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 transition hover:bg-muted"
        >
          {preview ? (
            <img src={preview} alt="preview" className="max-h-48 rounded-lg object-contain" />
          ) : (
            <>
              <ImagePlus className="size-10 text-muted-foreground" />
              <p className="text-sm font-medium">Nhấn để chọn ảnh</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, WEBP – tối đa 5MB</p>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {file && (
          <div className="flex items-center gap-2 rounded-lg border p-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-emerald-500" />
            {file.name}
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-destructive/10 p-2 text-sm text-destructive">{error}</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !file}
          >
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Gửi minh chứng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  const [transactions, setTransactions] = useState<any[]>([])
  const [loadingTx, setLoadingTx] = useState(false)
  const [joinedMembers, setJoinedMembers] = useState<GroupMember[]>([])

  // Confirm states
  const [approveConfirm, setApproveConfirm] = useState<string | null>(null) // transactionId
  const [approvingId, setApprovingId] = useState<string | null>(null)

  // Submit proof
  const [proofTxId, setProofTxId] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (!group) return
    setLoadingTx(true)
    try {
      // Fetch fresh group details to get the approved list
      const freshGroup = await fetchClient(`/groups/${group._id}`)
      const approvedList = freshGroup?.members ?? freshGroup?.data?.members ?? group.members ?? []
      setJoinedMembers(approvedList)

      // Fetch transaction history relating to user (as owner or sender)
      const res = await fetchClient('/transactions/me?page=1&itemPerPage=100')
      const allList = res?.list ?? []

      // Filter transactions that belong to this group
      const filtered = allList.filter((tx: any) => {
        const gId = typeof tx.groupId === 'object' && tx.groupId !== null
          ? tx.groupId._id
          : String(tx.groupId)
        return gId === group._id
      })

      const formattedPending = filtered.map((tx: any) => ({
        _id: tx._id,
        senderId: tx.senderId,
        amount: tx.amount,
        status: tx.status,
        createdAt: tx.createdAt
      }))
      setTransactions(formattedPending)
    } catch {
      setTransactions([])
      setJoinedMembers(group.members ?? [])
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
      toast.success('Duyệt thành viên thành công!')
    } catch (err: any) {
      toast.error(err.message || 'Duyệt thất bại.')
    } finally {
      setApprovingId(null)
      setApproveConfirm(null)
    }
  }

  if (!open || !group) return null

  const pendingTransactions = transactions.filter(
    (t) => t.status === 'held' || t.status === 'held_in_escrow',
  )
  const approvedTransactions = transactions.filter(
    (t) => t.status === 'approved_waiting_proof',
  )
  const proofSubmittedTransactions = transactions.filter(
    (t) => t.status === 'proof' || t.status === 'proof_submitted',
  )

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
<DialogContent className='w-[calc(100%-2rem)] sm:w-[95vw] !max-w-6xl max-h-[90vh] flex flex-col p-6 rounded-lg'>          <DialogHeader>
            <DialogTitle className='text-2xl'>Quản lý thành viên - {group.name}</DialogTitle>
            <DialogDescription>
              Danh sách người dùng Có sẵn duyệt và người dùng đã tham gia.
            </DialogDescription>
          </DialogHeader>

          <div className='flex-1 overflow-y-auto pr-1 scrollbar-thin'>
            <div className='grid gap-6 lg:grid-cols-2 py-1'>
              {/* Pending – Approve + Submit Proof */}
              <Card className='shadow-sm'>
                <CardHeader className=' pb-3'>
                  <CardTitle className='text-base'>Có sẵn duyệt</CardTitle>
                  <CardDescription>Người dùng Có sẵn duyệt.</CardDescription>
                </CardHeader>
                <CardContent className='p-0'>
                  {loadingTx ? (
                    <div className='flex justify-center py-8'>
                      <Loader2 className='size-6 animate-spin ' />
                    </div>
                  ) : pendingTransactions.length === 0 && approvedTransactions.length === 0 && proofSubmittedTransactions.length === 0 ? (
                    <p className='py-6 text-center text-sm '>Không có yêu cầu nào.</p>
                  ) : (
                    <div className='overflow-x-auto scrollbar-thin'>
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
                                    variant='default'
                                    className='rounded-md'
                                    disabled={approvingId === tx._id}
                                    onClick={() => setApproveConfirm(tx._id)}
                                  >
                                    {approvingId === tx._id ? (
                                      <Loader2 className='mr-2 size-4 animate-spin' />
                                    ) : (
                                      <ShieldCheck className='mr-2 size-4' />
                                    )}
                                    Duyệt
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
                                    variant='secondary'
                                    className='rounded-md'
                                    onClick={() => setProofTxId(tx._id)}
                                  >
                                    <ImagePlus className='mr-2 size-4' />
                                    Nộp minh chứng
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {proofSubmittedTransactions.map((tx) => (
                            <TableRow key={tx._id}>
                              <TableCell className='font-medium'>{getSenderDisplay(tx)}</TableCell>
                              <TableCell>{getSenderEmail(tx)}</TableCell>
                              <TableCell>
                                <div className='flex justify-end gap-2'>
                                  <Badge variant='outline' className='text-xs text-muted-foreground'>
                                    Đã nộp minh chứng (Chờ xác nhận)
                                  </Badge>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Joined Members */}
              <Card className='shadow-sm'>
                <CardHeader className='border-b pb-3'>
                  <CardTitle className='text-base'>Đã tham gia</CardTitle>
                  <CardDescription>Người dùng đã tham gia nhóm.</CardDescription>
                </CardHeader>
                <CardContent className='p-0'>
                  {joinedMembers.length === 0 ? (
                    <p className='py-6 text-center text-sm '>Chưa có thành viên.</p>
                  ) : (
                    <div className='overflow-x-auto scrollbar-thin'>
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
                                <Badge variant='secondary' className='rounded-full'>
                                  <BadgeCheck className='mr-1 size-3.5' />
                                  Đã tham gia
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
 
      {/* Confirm Approve */}
      <ConfirmDialog
        open={!!approveConfirm}
        title='Phê duyệt thành viên'
        description='Bạn có chắc chắn muốn thêm thành viên này vào nhóm không?'
        confirmVariant='default'
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
  const navigate = useNavigate()

  const [loadingUser, setLoadingUser] = useState(true)
  const [isVip, setIsVip] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [activeTab, setActiveTab] = useState<'created' | 'joined'>('created')
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

  // VIP check status
  useEffect(() => {
    let active = true

    const checkVipStatus = async () => {
      try {
        const res = await fetchClient('/users/me')
        if (res && res.isSubscriptionActive === true) {
          setIsVip(true)
        } else {
          setIsVip(false)
        }
      } catch (err) {
        console.error('Error fetching user info:', err)
        setIsVip(false)
      } finally {
        if (active) {
          setLoadingUser(false)
        }
      }
    }

    checkVipStatus()

    return () => {
      active = false
    }
  }, [])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  // Reset page when tab/filter/sort changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, statusFilter, priceOrder])

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    if (!user?.userID) return
    setLoading(true)
    setError(null)
    try {
      // Build search params for the API call to /api/groups/search
      const params = new URLSearchParams()
      if (activeTab === 'created') {
        params.set('ownerId', user.userID)
      } else {
        params.set('members', user.userID)
      }
      
      if (debouncedQuery.trim()) {
        params.set('name', debouncedQuery.trim())
      }
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }

      // Call GET /api/groups/search with params
      const res = await fetchClient(`/groups/search?${params.toString()}`)

      let fetchedList: Group[] = res?.data ?? res?.list ?? []

      // Client-side filtering
      if (activeTab === 'created') {
        fetchedList = fetchedList.filter((g) => {
          const ownerIdStr = typeof g.ownerId === 'object' && g.ownerId !== null
            ? g.ownerId._id
            : String(g.ownerId)
          return ownerIdStr === user.userID
        })
      } else {
        fetchedList = fetchedList.filter((g) => {
          return (g.members ?? []).some((m) => {
            const memberIdStr = typeof m === 'object' && m !== null ? m._id : String(m)
            return memberIdStr === user.userID
          })
        })
      }

      // Filter by keyword (searching group name case-insensitively)
      if (debouncedQuery.trim()) {
        const queryLower = debouncedQuery.trim().toLowerCase()
        fetchedList = fetchedList.filter((g) => g.name?.toLowerCase().includes(queryLower))
      }

      // Filter by status
      if (statusFilter !== 'all') {
        fetchedList = fetchedList.filter((g) => g.status === statusFilter)
      }

      // Sort client-side by price if order is requested
      if (priceOrder) {
        fetchedList.sort((a, b) =>
          priceOrder === 'asc' ? a.price - b.price : b.price - a.price,
        )
      }

      const totalItems = fetchedList.length
      const totalPagesCount = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))
      setTotalPages(totalPagesCount)

      // Paginate client-side
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
      const paginatedList = fetchedList.slice(startIndex, startIndex + ITEMS_PER_PAGE)

      setGroups(paginatedList)
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách nhóm.')
      setGroups([])
    } finally {
      setLoading(false)
    }
  }, [user?.userID, activeTab, debouncedQuery, statusFilter, priceOrder, currentPage])

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
      toast.success('Xóa nhóm thành công!')
      fetchGroups()
    } catch (err: any) {
      toast.error(err.message || 'Xóa nhóm thất bại.')
    } finally {
      setRemoving(false)
    }
  }

  if (loadingUser) {
    return (
      <div className='flex h-[400px] items-center justify-center'>
        <Loader2 className='size-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (!isVip) {
    return (
      <div className='flex items-center justify-center py-10 px-4'>
        <Card className='max-w-md w-full rounded-lg shadow-md text-center p-8 relative overflow-hidden'>
          <div className='relative flex flex-col items-center gap-6'>
            <div className='flex size-16 items-center justify-center bg-muted text-muted-foreground shadow-sm'>
              <Lock className='size-8' />
            </div>
            
            <div className='space-y-2'>
              <h3 className='text-2xl font-bold tracking-tight'>Yêu cầu tài khoản VIP</h3>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                Tính năng quản lý nhóm dùng chung phần mềm chỉ dành riêng cho thành viên VIP của EduShare. Kích hoạt VIP ngay để bắt đầu chia sẻ chi phí!
              </p>
            </div>

            <div className='w-full pt-4 space-y-3 relative z-10'>
              <Button 
                onClick={() => navigate('/dashboard/wallet')}
                variant='default'
                className='w-full rounded-full h-12 font-medium'
              >
                Nâng cấp VIP (29,000đ/tháng)
              </Button>
              <Button 
                onClick={() => navigate('/dashboard/overview')}
                variant='outline'
                className='w-full rounded-full h-12 font-medium'
              >
                Quay lại
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <Card>
        <CardContent>
          <Badge variant='secondary' className='rounded-full'>
            Manage Group
          </Badge>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight'>Quản lý nhóm của tôi</h2>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-muted-foreground'>
            Xem nhanh trạng thái từng nhóm, tiến độ lấp đầy slot và các thao tác quan trọng ngay
            dưới card.
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'created' | 'joined')}
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-2 bg-muted p-1 rounded-lg h-11'>
          <TabsTrigger value='created' className='rounded-md text-sm font-medium transition-all'>
            Nhóm tôi tạo
          </TabsTrigger>
          <TabsTrigger value='joined' className='rounded-md text-sm font-medium transition-all'>
            Nhóm tôi tham gia
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardContent className='p-4 md:p-5'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center'>
            {/* Search */}
            <div className='relative w-full md:max-w-sm'>
              <Search className='pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 ' />
              <Input
                id='search-group-input'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Tìm nhóm...'
                className='h-11 pl-11'
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
                  className='!h-11 w-full px-4'
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
              variant={priceOrder ? 'secondary' : 'outline'}
              className='h-11 px-4'
              onClick={() =>
                setPriceOrder((prev) =>
                  prev === null ? 'asc' : prev === 'asc' ? 'desc' : null,
                )
              }
            >
              {priceOrder === 'asc' ? (
                <ArrowUp className='mr-2 size-4' />
              ) : priceOrder === 'desc' ? (
                <ArrowDown className='mr-2 size-4' />
              ) : (
                <ArrowUpDown className='mr-2 size-4' />
              )}
              Giá{' '}
              {priceOrder === 'asc' ? '↑ Tăng dần' : priceOrder === 'desc' ? '↓ Giảm dần' : 'tiền'}
            </Button>

            {loading && (
              <div className='flex items-center gap-2 text-sm '>
                <Loader2 className='size-4 animate-spin' />
                Đang tải...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className='rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive'>
          {error}
        </div>
      )}

      {/* Groups Grid */}
      {!loading && groups.length === 0 && !error ? (
        <div className='flex flex-col items-center justify-center border border-dashed py-16 rounded-lg bg-card shadow-sm'>
          <Users className='size-12 text-muted-foreground/40' />
          {activeTab === 'created' ? (
            <>
              <p className='mt-3 text-sm font-medium text-muted-foreground'>Bạn chưa tạo nhóm nào.</p>
              <p className='mt-1 text-xs text-muted-foreground'>Hãy tạo nhóm đầu tiên của bạn!</p>
            </>
          ) : (
            <>
              <p className='mt-3 text-sm font-medium text-muted-foreground'>Bạn chưa tham gia nhóm nào.</p>
              <p className='mt-1 text-xs text-muted-foreground'>Hãy khám phá các nhóm có sẵn để gia nhập!</p>
            </>
          )}
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
          {loading
            ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <Card key={i} className='animate-pulse rounded-lg'>
                  <CardHeader className='space-y-4'>
                    <div className='h-5 w-2/3 rounded-md bg-muted' />
                    <div className='h-3 w-1/2 rounded-md bg-muted/70' />
                    <div className='h-2.5 rounded-full bg-muted/70' />
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='h-14 bg-muted/70' />
                      <div className='h-14 bg-muted/70' />
                    </div>
                    <div className='h-10 bg-muted' />
                  </CardContent>
                </Card>
              ))
            : groups.map((group) => {
                const progress = Math.round((group.occupiedSlots / group.totalSlots) * 100)
                const statusKey = group.status as string

                return (
                  <Card
                    key={group._id}
                    className='border transition hover:shadow-md'
                  >
                    <CardHeader className='space-y-4'>
                      <div className='flex items-start justify-between gap-4'>
                        <div>
                          <CardTitle className='text-xl'>{group.name}</CardTitle>
                          <CardDescription className='mt-1 text-sm'>
                            {group.occupiedSlots}/{group.totalSlots} thành viên
                          </CardDescription>
                        </div>
                        <Badge variant={STATUS_VARIANTS[statusKey] ?? 'outline'} className='rounded-full'>
                          {STATUS_LABEL[statusKey] ?? group.status}
                        </Badge>
                      </div>

                      <div className='space-y-2'>
                        <div className='flex items-center justify-between text-sm text-muted-foreground'>
                          <span>Độ lấp đầy</span>
                          <span className='font-medium'>{progress}%</span>
                        </div>
                        <Progress value={progress} className='h-2.5' />
                      </div>
                    </CardHeader>

                    <CardContent className='space-y-4'>
                      <div className='grid grid-cols-2 gap-3 text-sm'>
                        <div className='border p-3'>
                          <p className='text-xs '>Slot còn lại</p>
                          <p className='mt-1 font-semibold'>{group.totalSlots - group.occupiedSlots} slot</p>
                        </div>
                        <div className='border p-3'>
                          <p className='text-xs '>Giá / slot</p>
                          <p className='mt-1 font-semibold'>
                            {group.price?.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>

                      {activeTab === 'created' ? (
                        <>
                          {/* Manage Members button */}
                          <Button
                            id={`manage-members-btn-${group._id}`}
                            variant='default'
                            className='w-full rounded-md'
                            onClick={() => setManagingGroup(group)}
                          >
                            <Users className='mr-2 size-4' />
                            Quản lý thành viên
                          </Button>

                          {/* Action buttons */}
                          <div className='flex flex-wrap gap-2 pt-1'>
                            <Button
                              id={`remove-group-btn-${group._id}`}
                              size='sm'
                              variant='destructive'
                              className='rounded-md'
                              onClick={() => setRemoveConfirm(group._id)}
                            >
                              <Trash2 className='mr-2 size-4' />
                              xoá nhóm
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className='rounded-md border bg-muted/40 p-3 text-sm'>
                          <p className='text-xs text-muted-foreground'>Chủ nhóm</p>
                          <p className='mt-1 font-semibold'>
                            {typeof group.ownerId === 'object' && group.ownerId !== null
                              ? group.ownerId.displayName || group.ownerId.username || 'Chủ nhóm'
                              : 'Chủ nhóm'}
                          </p>
                        </div>
                      )}
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
                    className={currentPage === page ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground' : ''}
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
        description='Bạn có chắc chắn muốn xóa nhóm này không?'
        confirmVariant='destructive'
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
