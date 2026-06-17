import { useState, useEffect, useCallback } from 'react'
import { Users, PlayCircle, Eye, ShieldOff, RotateCcw, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { DashboardService, type AdminGroup, type GroupStatus } from '@/services/dashboard.service'

// ---- helpers ----
const STATUS_TABS: { value: GroupStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'available', label: 'Đang mở' },
  { value: 'full', label: 'Đã đầy' },
  { value: 'expired', label: 'Hết hạn' },
  { value: 'closed', label: 'Đã đóng' },
  { value: 'hidden', label: 'Ẩn' },
]

const STATUS_BADGE: Record<GroupStatus, { label: string; className: string }> = {
  available: { label: 'Đang mở', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  full: { label: 'Đã đầy', className: 'bg-sky-100 text-sky-700 border-sky-200' },
  expired: { label: 'Hết hạn', className: 'bg-slate-100 text-slate-500 border-slate-200' },
  closed: { label: 'Đã đóng', className: 'bg-rose-100 text-rose-700 border-rose-200' },
  hidden: { label: 'Ẩn', className: 'bg-amber-100 text-amber-700 border-amber-200' },
}

const CATEGORY_BADGE: Record<string, string> = {
  Productivity: 'bg-violet-100 text-violet-700 border-violet-200',
  Design: 'bg-pink-100 text-pink-700 border-pink-200',
  'AI Tools': 'bg-cyan-100 text-cyan-700 border-cyan-200',
}

const ITEMS_PER_PAGE = 9

// ---- component ----
export default function AdminGroups() {
  const [activeTab, setActiveTab] = useState<GroupStatus | 'all'>('all')
  const [searchName, setSearchName] = useState('')
  const [debouncedName, setDebouncedName] = useState('')
  const [groups, setGroups] = useState<AdminGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedName(searchName.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchName])

  // reset page when tab changes
  useEffect(() => {
    setPage(1)
  }, [activeTab])

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // If there is a name filter OR a status filter → use /search
      // All-tab with no name search → use /groups (no filter required by backend)
      const hasNameFilter = debouncedName.length > 0
      const hasStatusFilter = activeTab !== 'all'

      if (hasNameFilter || hasStatusFilter) {
        const res = await DashboardService.searchGroups({
          ...(hasNameFilter ? { name: debouncedName } : {}),
          ...(hasStatusFilter ? { status: activeTab as GroupStatus } : {}),
          page,
          itemPerPage: ITEMS_PER_PAGE,
        })
        setGroups(res.list ?? [])
        setTotalPages(res.totalPages || 1)
        setTotalItems(res.totalItems || 0)
      } else {
        const res = await DashboardService.getGroups({ page, itemPerPage: ITEMS_PER_PAGE })
        setGroups(res.list ?? [])
        setTotalPages(res.totalPages || 1)
        setTotalItems(res.totalItems || 0)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu')
      setGroups([])
    } finally {
      setLoading(false)
    }
  }, [activeTab, debouncedName, page])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const handleClose = async (id: string) => {
    setActionLoading(id + '-close')
    try {
      await DashboardService.updateGroupStatus(id, 'closed')
      await fetchGroups()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể đóng nhóm')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRestore = async (id: string) => {
    setActionLoading(id + '-restore')
    try {
      await DashboardService.restoreGroupStatus(id)
      await fetchGroups()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể khôi phục nhóm')
    } finally {
      setActionLoading(null)
    }
  }

  // ---- render group card ----
  const renderCard = (group: AdminGroup) => {
    const statusInfo = STATUS_BADGE[group.status]
    const categoryClass = CATEGORY_BADGE[group.category] ?? 'bg-slate-100 text-slate-600 border-slate-200'
    const ownerName = group.ownerId?.displayName ?? group.ownerId?.username ?? 'Unknown'
    const ownerAvatar = group.ownerId?.avatar ?? ''
    const isClosed = group.status === 'closed' || group.status === 'hidden'

    return (
      <Card
        key={group._id}
        className='rounded-xl border-slate-200/70 shadow-sm shadow-sky-100/30 overflow-hidden flex flex-col hover:border-sky-200 hover:shadow-md transition-all'
      >
        <CardHeader className='pb-3'>
          <div className='flex items-start justify-between gap-2 flex-wrap'>
            <Badge variant='outline' className={`rounded-xl px-2.5 py-0.5 text-xs font-medium border ${categoryClass}`}>
              {group.category}
            </Badge>
            <Badge variant='outline' className={`rounded-xl px-2.5 py-0.5 text-xs font-medium border ${statusInfo.className}`}>
              {statusInfo.label}
            </Badge>
          </div>
          <CardTitle className='text-base mt-3 line-clamp-2 leading-snug'>{group.name}</CardTitle>
          <CardDescription className='text-xs truncate'>{group._id}</CardDescription>
        </CardHeader>

        <CardContent className='pb-3 flex-1 space-y-3'>
          {/* Owner */}
          <div className='flex items-center gap-2.5'>
            <Avatar className='h-8 w-8 border border-slate-100 shadow-sm shrink-0'>
              <AvatarImage src={ownerAvatar} alt={ownerName} />
              <AvatarFallback className='bg-sky-100 text-sky-700 text-xs'>{ownerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className='min-w-0'>
              <p className='text-xs text-slate-400'>Chủ nhóm</p>
              <p className='text-sm font-medium truncate'>{ownerName}</p>
            </div>
            <span className='ml-auto text-xs text-slate-400 shrink-0'>
              ⭐ {group.ownerId?.trustScore ?? '—'}
            </span>
          </div>

          {/* Slots & Price */}
          <div className='grid grid-cols-2 gap-2 text-xs'>
            <div className='flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5'>
              <Users className='w-3.5 h-3.5 text-slate-400 shrink-0' />
              <span className='text-slate-500'>Thành viên</span>
              <span className='ml-auto font-semibold text-slate-700'>
                {group.occupiedSlots}/{group.totalSlots}
              </span>
            </div>
            <div className='flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5'>
              <Eye className='w-3.5 h-3.5 text-slate-400 shrink-0' />
              <span className='text-slate-500'>Giá/slot</span>
              <span className='ml-auto font-semibold text-slate-700'>
                {group.price?.toLocaleString('vi-VN')}₫
              </span>
            </div>
          </div>

          {/* Expiry */}
          {group.expiredAt && (
            <p className='text-xs text-slate-400'>
              Hết hạn: {new Date(group.expiredAt).toLocaleDateString('vi-VN')}
            </p>
          )}
        </CardContent>

        <CardFooter className='pt-0 pb-4 px-5 border-t border-slate-50 mt-auto flex gap-2'>
          {isClosed ? (
            <Button
              variant='outline'
              size='sm'
              className='rounded-xl text-emerald-700 border-emerald-200 hover:bg-emerald-50 mt-3 w-full text-xs'
              disabled={actionLoading === group._id + '-restore'}
              onClick={() => handleRestore(group._id)}
            >
              {actionLoading === group._id + '-restore' ? (
                <Loader2 className='w-3.5 h-3.5 mr-1.5 animate-spin' />
              ) : (
                <RotateCcw className='w-3.5 h-3.5 mr-1.5' />
              )}
              KHÔI PHỤC
            </Button>
          ) : (
            <Button
              variant='outline'
              size='sm'
              className='rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50 mt-3 w-full text-xs'
              disabled={actionLoading === group._id + '-close'}
              onClick={() => handleClose(group._id)}
            >
              {actionLoading === group._id + '-close' ? (
                <Loader2 className='w-3.5 h-3.5 mr-1.5 animate-spin' />
              ) : (
                <ShieldOff className='w-3.5 h-3.5 mr-1.5' />
              )}
              ĐÓNG NHÓM
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }

  // ---- render content ----
  const renderContent = () => {
    if (loading) {
      return (
        <div className='flex flex-col items-center justify-center py-20 text-slate-400'>
          <Loader2 className='h-10 w-10 animate-spin mb-3 text-sky-400' />
          <p className='text-sm'>Đang tải dữ liệu...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className='flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-rose-200 bg-rose-50/40 text-rose-500'>
          <ShieldOff className='h-10 w-10 mb-3 text-rose-300' />
          <p className='text-sm font-medium'>Không thể tải dữ liệu</p>
          <p className='text-xs mt-1 text-rose-400'>{error}</p>
          <Button variant='outline' size='sm' className='mt-4 text-rose-600 border-rose-200' onClick={fetchGroups}>
            Thử lại
          </Button>
        </div>
      )
    }

    if (!groups || groups.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center p-12 text-center text-slate-400 rounded-xl border border-dashed border-slate-200'>
          <PlayCircle className='h-12 w-12 mb-4 text-slate-200' />
          <p className='text-sm'>Không có nhóm nào trong danh mục này.</p>
        </div>
      )
    }

    return (
      <>
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {groups.map(renderCard)}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-between pt-4 border-t border-slate-100'>
            <p className='text-xs text-slate-400'>
              Tổng <span className='font-semibold text-slate-600'>{totalItems}</span> nhóm
            </p>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='rounded-lg h-8 w-8 p-0'
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className='w-4 h-4' />
              </Button>
              <span className='text-xs text-slate-600 font-medium'>
                {page} / {totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                className='rounded-lg h-8 w-8 p-0'
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className='w-4 h-4' />
              </Button>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <Card>
        <CardContent className='pt-6'>
          <p className='text-sm font-medium text-emerald-600'>Quản lý hoạt động</p>
          <h2 className='mt-2 text-3xl font-semibold tracking-tight'>Danh sách Nhóm</h2>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-500'>
            Theo dõi các nhóm chia sẻ, kiểm tra bằng chứng giao dịch và xử lý các vấn đề nội bộ.
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className='relative max-w-sm'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none' />
        <Input
          id='admin-groups-search'
          placeholder='Tìm theo tên nhóm...'
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className='pl-9 rounded-xl border-slate-200 focus-visible:ring-sky-300'
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as GroupStatus | 'all')} className='w-full'>
        <TabsList className='flex w-full overflow-x-auto justify-start gap-1 p-1 h-auto border border-slate-200/60 rounded-2xl shadow-sm scrollbar-none flex-wrap'>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className='rounded-xl px-4 py-2 text-sm data-[state=active]:bg-sky-600 data-[state=active]:text-white data-[state=active]:shadow-sm'
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUS_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className='mt-6 outline-none'>
            {renderContent()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
