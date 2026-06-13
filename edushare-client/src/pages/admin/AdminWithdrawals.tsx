import { useState, useEffect, useCallback } from 'react'
import {
  Check,
  X,
  Building,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  DashboardService,
  type AdminWithdrawal,
  type WithdrawalStatus,
} from '@/services/dashboard.service'

// ─── constants ────────────────────────────────────────────────────────────────

const STATUS_TABS: { value: WithdrawalStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Đang chờ' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
]

const ITEMS_PER_PAGE = 10

// ─── helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN').format(amount) + ' VND'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

function StatusBadge({ status }: { status: WithdrawalStatus }) {
  switch (status) {
    case 'pending':
      return (
        <Badge
          variant='secondary'
          className='bg-amber-100 text-amber-700 hover:bg-amber-100/80 rounded-xl px-3 py-1 font-medium border-none flex w-max items-center gap-1.5'
        >
          <Clock className='w-3.5 h-3.5' /> Đang chờ
        </Badge>
      )
    case 'approved':
      return (
        <Badge
          variant='secondary'
          className='bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 rounded-xl px-3 py-1 font-medium border-none flex w-max items-center gap-1.5'
        >
          <CheckCircle2 className='w-3.5 h-3.5' /> Đã duyệt
        </Badge>
      )
    case 'rejected':
      return (
        <Badge
          variant='secondary'
          className='bg-rose-100 text-rose-700 hover:bg-rose-100/80 rounded-xl px-3 py-1 font-medium border-none flex w-max items-center gap-1.5'
        >
          <XCircle className='w-3.5 h-3.5' /> Từ chối
        </Badge>
      )
    default:
      return null
  }
}

// ─── component ────────────────────────────────────────────────────────────────

export default function AdminWithdrawals() {
  const [activeTab, setActiveTab] = useState<WithdrawalStatus | 'all'>('all')
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // action loading: stores the withdrawal id being processed
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // reject dialog
  const [rejectTarget, setRejectTarget] = useState<AdminWithdrawal | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)

  // reset page when tab changes
  useEffect(() => {
    setPage(1)
  }, [activeTab])

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await DashboardService.getAdminWithdrawals({
        ...(activeTab !== 'all' ? { status: activeTab as WithdrawalStatus } : {}),
        page,
        itemPerPage: ITEMS_PER_PAGE,
      })
      setWithdrawals(res.list ?? [])
      setTotalPages(res.totalPages ?? 1)
      setTotalItems(res.totalItems ?? 0)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu')
      setWithdrawals([])
    } finally {
      setLoading(false)
    }
  }, [activeTab, page])

  useEffect(() => {
    fetchWithdrawals()
  }, [fetchWithdrawals])

  // ── approve ──────────────────────────────────────────────────────────────────
  const handleApprove = async (item: AdminWithdrawal) => {
    setActionLoading(item.id)
    try {
      await DashboardService.reviewWithdrawal(item.id, { status: 'approved' })
      toast.success('Đã phê duyệt thành công! 🎉', {
        description: `Đã chuyển tiền cho ${item.user?.displayName ?? 'Owner'}`,
        duration: 4000,
      })
      await fetchWithdrawals()
    } catch (err: unknown) {
      toast.error('Phê duyệt thất bại', {
        description: err instanceof Error ? err.message : 'Có lỗi xảy ra',
      })
    } finally {
      setActionLoading(null)
    }
  }

  // ── open reject dialog ────────────────────────────────────────────────────────
  const openRejectDialog = (item: AdminWithdrawal) => {
    setRejectTarget(item)
    setRejectReason('')
  }

  // ── confirm reject ────────────────────────────────────────────────────────────
  const handleRejectConfirm = async () => {
    if (!rejectTarget) return
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối')
      return
    }
    setRejectLoading(true)
    try {
      await DashboardService.reviewWithdrawal(rejectTarget.id, {
        status: 'rejected',
        rejectReason: rejectReason.trim(),
      })
      toast.error('Đã từ chối yêu cầu rút tiền', {
        description: 'Lý do đã được ghi nhận',
      })
      setRejectTarget(null)
      await fetchWithdrawals()
    } catch (err: unknown) {
      toast.error('Từ chối thất bại', {
        description: err instanceof Error ? err.message : 'Có lỗi xảy ra',
      })
    } finally {
      setRejectLoading(false)
    }
  }

  // ─── render ──────────────────────────────────────────────────────────────────
  const renderBody = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className='py-20 text-center'>
            <div className='flex flex-col items-center gap-3 text-slate-400'>
              <Loader2 className='h-8 w-8 animate-spin text-sky-400' />
              <p className='text-sm'>Đang tải dữ liệu...</p>
            </div>
          </TableCell>
        </TableRow>
      )
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={6} className='py-16 text-center'>
            <div className='flex flex-col items-center gap-3 text-rose-500'>
              <AlertTriangle className='h-8 w-8 text-rose-300' />
              <p className='text-sm font-medium'>Không thể tải dữ liệu</p>
              <p className='text-xs text-rose-400'>{error}</p>
              <Button
                variant='outline'
                size='sm'
                className='mt-1 text-rose-600 border-rose-200'
                onClick={fetchWithdrawals}
              >
                Thử lại
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )
    }

    if (withdrawals.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className='py-16 text-center text-slate-400 text-sm'>
            Không có lệnh rút tiền nào.
          </TableCell>
        </TableRow>
      )
    }

    return withdrawals.map((item) => (
      <TableRow key={item.id} className='hover:bg-slate-50/50 border-slate-100 transition-colors'>
        {/* Owner */}
        <TableCell className='py-4 pl-6'>
          <div className='flex items-center gap-3'>
            <Avatar className='h-9 w-9 border border-slate-100 shadow-sm'>
              <AvatarImage src={item.user?.avatar} alt={item.user?.displayName} />
              <AvatarFallback className='bg-sky-100 text-sky-700'>
                {(item.user?.displayName ?? '?').charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className='font-medium text-sm'>{item.user?.displayName ?? '—'}</p>
              <p className='text-xs text-slate-400'>{item.user?.email ?? ''}</p>
            </div>
          </div>
        </TableCell>

        {/* Amount */}
        <TableCell className='py-4'>
          <span className='font-semibold text-slate-800'>{formatCurrency(item.amount)}</span>
        </TableCell>

        {/* Bank info */}
        <TableCell className='py-4'>
          <div className='flex items-start gap-2 text-sm text-slate-600'>
            <Building className='w-4 h-4 text-slate-400 shrink-0 mt-0.5' />
            <div>
              <p className='font-medium'>{item.bankName}</p>
              <p className='text-xs text-slate-400'>
                {item.accountNumber} · {item.accountName}
              </p>
            </div>
          </div>
        </TableCell>

        {/* Date */}
        <TableCell className='py-4'>
          <span className='text-sm text-slate-500'>{formatDate(item.createdAt)}</span>
        </TableCell>

        {/* Status */}
        <TableCell className='py-4'>
          <StatusBadge status={item.status} />
          {item.status === 'rejected' && item.rejectReason && (
            <p className='text-xs text-slate-400 mt-1 max-w-[160px] truncate' title={item.rejectReason}>
              {item.rejectReason}
            </p>
          )}
        </TableCell>

        {/* Actions */}
        <TableCell className='py-4 pr-6 text-right'>
          {item.status === 'pending' ? (
            <div className='flex items-center justify-end gap-2'>
              <Button
                variant='ghost'
                size='icon'
                disabled={actionLoading === item.id}
                onClick={() => openRejectDialog(item)}
                className='h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-full'
                title='Từ chối'
              >
                <X className='h-4 w-4' />
              </Button>
              <Button
                size='sm'
                disabled={actionLoading === item.id}
                onClick={() => handleApprove(item)}
                className='h-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all active:scale-95'
              >
                {actionLoading === item.id ? (
                  <Loader2 className='h-3.5 w-3.5 mr-1 animate-spin' />
                ) : (
                  <Check className='h-4 w-4 mr-1' />
                )}
                Phê duyệt
              </Button>
            </div>
          ) : (
            <span className='text-xs text-slate-400 italic'>Đã xử lý</span>
          )}
        </TableCell>
      </TableRow>
    ))
  }

  return (
    <>
      <div className='space-y-6'>
        {/* Header */}
        <Card>
          <CardContent className='pt-6'>
            <Badge className='rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-100'>
              Quản lý Tài chính
            </Badge>
            <h2 className='mt-3 text-3xl font-semibold tracking-tight'>Phê duyệt rút tiền</h2>
            <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-500'>
              Kiểm tra tài khoản và xác nhận chuyển tiền hoa hồng cho các Chủ nhóm (Owner).
            </p>
          </CardContent>
        </Card>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as WithdrawalStatus | 'all')}>
          <TabsList className='flex w-full overflow-x-auto justify-start gap-1 p-1 h-auto border border-slate-200/60 rounded-2xl shadow-sm scrollbar-none'>
            {STATUS_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='rounded-xl px-4 py-2 text-sm data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm'
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Table */}
        <Card>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Danh sách yêu cầu</CardTitle>
                <CardDescription className='mt-1'>
                  {totalItems > 0 ? (
                    <>
                      Tổng <span className='font-semibold text-slate-600'>{totalItems}</span> lệnh rút tiền
                    </>
                  ) : (
                    'Danh sách tự động cập nhật khi có Owner yêu cầu rút tiền.'
                  )}
                </CardDescription>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={fetchWithdrawals}
                disabled={loading}
                className='rounded-xl text-xs'
              >
                {loading ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : 'Làm mới'}
              </Button>
            </div>
          </CardHeader>

          <CardContent className='p-0'>
            <div className='overflow-x-auto scrollbar-thin'>
              <Table>
                <TableHeader>
                  <TableRow className='hover:bg-transparent border-slate-100'>
                    <TableHead className='py-4 pl-6 font-medium'>Chủ nhóm (Owner)</TableHead>
                    <TableHead className='py-4 font-medium'>Số tiền yêu cầu</TableHead>
                    <TableHead className='py-4 font-medium'>Thông tin Ngân hàng</TableHead>
                    <TableHead className='py-4 font-medium'>Thời gian</TableHead>
                    <TableHead className='py-4 font-medium'>Trạng thái</TableHead>
                    <TableHead className='py-4 pr-6 text-right font-medium'>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderBody()}</TableBody>
              </Table>
            </div>
          </CardContent>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-between px-6 py-4 border-t border-slate-100'>
              <p className='text-xs text-slate-400'>
                Trang <span className='font-semibold text-slate-600'>{page}</span> / {totalPages}
              </p>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  className='rounded-lg h-8 w-8 p-0'
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className='w-4 h-4' />
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  className='rounded-lg h-8 w-8 p-0'
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className='w-4 h-4' />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Reject Dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className='sm:max-w-md rounded-2xl'>
          <DialogHeader>
            <DialogTitle className='text-rose-600'>Từ chối yêu cầu rút tiền</DialogTitle>
            <DialogDescription>
              Bạn đang từ chối lệnh rút{' '}
              <span className='font-semibold text-slate-700'>
                {rejectTarget ? formatCurrency(rejectTarget.amount) : ''}
              </span>{' '}
              của <span className='font-semibold text-slate-700'>{rejectTarget?.user?.displayName ?? 'Owner'}</span>.
              <br />
              Tiền sẽ được hoàn lại vào ví của họ.
            </DialogDescription>
          </DialogHeader>

          <div className='py-2'>
            <label className='text-sm font-medium text-slate-700 mb-1.5 block'>
              Lý do từ chối <span className='text-rose-500'>*</span>
            </label>
            <Textarea
              placeholder='Nhập lý do từ chối...'
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className='rounded-xl border-slate-200 focus-visible:ring-rose-300 resize-none'
              rows={3}
            />
          </div>

          <DialogFooter className='gap-2'>
            <Button
              variant='outline'
              className='rounded-xl'
              onClick={() => setRejectTarget(null)}
              disabled={rejectLoading}
            >
              Huỷ
            </Button>
            <Button
              variant='destructive'
              className='rounded-xl'
              onClick={handleRejectConfirm}
              disabled={rejectLoading || !rejectReason.trim()}
            >
              {rejectLoading ? (
                <>
                  <Loader2 className='h-3.5 w-3.5 mr-1.5 animate-spin' /> Đang xử lý...
                </>
              ) : (
                <>
                  <X className='h-3.5 w-3.5 mr-1.5' /> Xác nhận từ chối
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
