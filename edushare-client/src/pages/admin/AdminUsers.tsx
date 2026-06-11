import {
  MoreHorizontal, ShieldCheck, Clock, Mail, LifeBuoy, Ban, Search,
  ChevronLeft, ChevronRight, Loader2, Trash2, UserCheck, UserX, Eye,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useState, useEffect, useCallback } from 'react'
import { DashboardService, type AdminUser } from '@/services/dashboard.service'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRoleBadge(role: AdminUser['role']) {
  switch (role) {
    case 'admin':
      return <Badge className='rounded-xl px-2.5 py-1 text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'>Admin</Badge>
    case 'member':
      return <Badge className='rounded-xl px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'>Member</Badge>
    default:
      return <Badge className='rounded-xl px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'>Guest</Badge>
  }
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex items-start justify-between gap-4 py-2'>
      <span className='text-sm text-muted-foreground shrink-0 w-36'>{label}</span>
      <span className='text-sm font-medium text-right break-all'>{value ?? '—'}</span>
    </div>
  )
}

const ITEMS_PER_PAGE = 10

// ─── Detail Dialog ────────────────────────────────────────────────────────────

function UserDetailDialog({
  userId,
  open,
  onOpenChange,
}: {
  userId: string | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId || !open) return
    setLoading(true)
    setUser(null)
    DashboardService.getUserById(userId)
      .then(setUser)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [userId, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Chi tiết người dùng</DialogTitle>
          <DialogDescription>Thông tin đầy đủ của tài khoản.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='flex justify-center py-10'>
            <Loader2 className='size-6 animate-spin text-muted-foreground' />
          </div>
        ) : user ? (
          <div>
            {/* Avatar + name */}
            <div className='flex items-center gap-4 mb-4'>
              <Avatar className='size-14 border border-border'>
                <AvatarImage src={user.avatar ?? undefined} />
                <AvatarFallback className='bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 text-lg font-semibold'>
                  {user.displayName?.charAt(0)?.toUpperCase() ?? '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className='font-semibold text-base'>{user.displayName}</p>
                <p className='text-sm text-muted-foreground'>{user.email}</p>
              </div>
            </div>
            <Separator className='mb-3' />
            <DetailRow label='ID' value={<span className='font-mono text-xs'>{user._id}</span>} />
            <DetailRow label='Vai trò' value={getRoleBadge(user.role)} />
            <DetailRow label='Trạng thái' value={user.isActive
              ? <span className='text-emerald-600 dark:text-emerald-400 font-medium'>Hoạt động</span>
              : <span className='text-rose-500 font-medium'>Bị khóa</span>} />
            <DetailRow label='Subscription'
              value={user.isSubscriptionActive
                ? <span className='text-emerald-600 dark:text-emerald-400 font-medium'>VIP đang hoạt động</span>
                : <span className='text-muted-foreground'>Chưa có</span>} />
            <DetailRow label='Ngày tạo' value={new Date(user.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
          </div>
        ) : (
          <p className='py-6 text-center text-sm text-muted-foreground'>Không tìm thấy người dùng.</p>
        )}

        <DialogFooter showCloseButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmVariant = 'default',
  loading,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description: string
  confirmLabel: string
  confirmVariant?: 'default' | 'destructive'
  loading: boolean
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline' disabled={loading}>Hủy</Button>
          </DialogClose>
          <Button variant={confirmVariant} disabled={loading} onClick={onConfirm}>
            {loading && <Loader2 className='mr-2 size-4 animate-spin' />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminUsers() {
  // List state
  const [users, setUsers] = useState<AdminUser[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'guest' | 'member' | 'admin'>('all')
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  // Dialog state
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Ban/unban confirm
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null)
  const [banOpen, setBanOpen] = useState(false)
  const [banLoading, setBanLoading] = useState(false)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ── Fetch list ──────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(() => {
    setLoading(true)
    setListError(null)
    DashboardService.getUsers({
      page,
      itemPerPage: ITEMS_PER_PAGE,
      search: search || undefined,
      role: roleFilter === 'all' ? undefined : roleFilter,
    })
      .then((res) => {
        setUsers(res.list)
        setTotalPages(res.totalPages)
        setTotalItems(res.totalItems)
      })
      .catch(() => setListError('Không thể tải danh sách người dùng.'))
      .finally(() => setLoading(false))
  }, [page, search, roleFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput)
  }

  const handleRoleChange = (val: string) => {
    setRoleFilter(val as typeof roleFilter)
    setPage(1)
  }

  const openDetail = (id: string) => {
    setDetailId(id)
    setDetailOpen(true)
  }

  const openBan = (user: AdminUser) => {
    setBanTarget(user)
    setBanOpen(true)
  }

  const openDelete = (user: AdminUser) => {
    setDeleteTarget(user)
    setDeleteOpen(true)
  }

  const handleBanConfirm = async () => {
    if (!banTarget) return
    setBanLoading(true)
    try {
      const res = banTarget.isActive
        ? await DashboardService.banUser(banTarget._id)
        : await DashboardService.unbanUser(banTarget._id)
      setUsers((prev) => prev.map((u) => (u._id === res.data._id ? res.data : u)))
      setBanOpen(false)
    } catch {
      // toast nếu có
    } finally {
      setBanLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await DashboardService.deleteUser(deleteTarget._id)
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id))
      setTotalItems((n) => n - 1)
      setDeleteOpen(false)
    } catch {
      // toast nếu có
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className='space-y-6'>
      {/* Hero */}
      <Card>
        <CardContent>
          <Badge className='rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-300'>
            Users
          </Badge>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight'>Danh sách người dùng</h2>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-muted-foreground'>
            Quản lý, hỗ trợ và theo dõi mức độ uy tín của các thành viên trong cộng đồng EduShare.
          </p>
        </CardContent>
      </Card>

      {/* Table card */}
      <Card className='rounded-xl overflow-hidden'>
        <CardHeader className='pb-4 border-b'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <CardTitle>Tất cả người dùng</CardTitle>
              <CardDescription className='mt-1'>
                {loading ? 'Đang tải…' : `${totalItems.toLocaleString('vi-VN')} người dùng`}
              </CardDescription>
            </div>

            {/* Filters */}
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
              <div className='flex gap-2'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
                  <Input
                    placeholder='Tìm tên, email…'
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className='pl-9 h-9 w-56 rounded-xl'
                  />
                </div>
                <Button size='sm' variant='secondary' className='h-9 rounded-xl px-4' onClick={handleSearch}>
                  Tìm
                </Button>
              </div>

              <Select value={roleFilter} onValueChange={handleRoleChange}>
                <SelectTrigger className='h-9 w-36 rounded-xl'>
                  <SelectValue placeholder='Vai trò' />
                </SelectTrigger>
                <SelectContent className='rounded-xl'>
                  <SelectItem value='all'>Tất cả</SelectItem>
                  <SelectItem value='admin'>Admin</SelectItem>
                  <SelectItem value='member'>Member</SelectItem>
                  <SelectItem value='guest'>Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className='p-0'>
          {listError ? (
            <div className='flex flex-col items-center justify-center gap-3 py-16'>
              <p className='text-sm text-destructive'>{listError}</p>
              <Button size='sm' variant='outline' onClick={fetchUsers}>Thử lại</Button>
            </div>
          ) : (
            <>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow className='hover:bg-transparent border-border'>
                      <TableHead className='py-4 pl-6 font-medium'>Người dùng</TableHead>
                      <TableHead className='py-4 font-medium'>Vai trò</TableHead>
                      <TableHead className='py-4 font-medium'>Trạng thái</TableHead>
                      <TableHead className='py-4 font-medium'>Subscription</TableHead>
                      <TableHead className='py-4 font-medium'>Ngày tạo</TableHead>
                      <TableHead className='py-4 pr-6 text-right font-medium'>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading
                      ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                          <TableRow key={i} className='border-border'>
                            <TableCell className='py-4 pl-6'>
                              <div className='flex items-center gap-4 animate-pulse'>
                                <div className='size-10 rounded-full bg-muted' />
                                <div className='space-y-2'>
                                  <div className='h-3 w-28 rounded bg-muted' />
                                  <div className='h-3 w-36 rounded bg-muted' />
                                </div>
                              </div>
                            </TableCell>
                            {[...Array(4)].map((_, j) => (
                              <TableCell key={j} className='py-4'>
                                <div className='h-3 w-20 rounded bg-muted animate-pulse' />
                              </TableCell>
                            ))}
                            <TableCell />
                          </TableRow>
                        ))
                      : users.length === 0
                      ? (
                        <TableRow>
                          <TableCell colSpan={6} className='py-16 text-center text-sm text-muted-foreground'>
                            Không tìm thấy người dùng nào.
                          </TableCell>
                        </TableRow>
                      )
                      : users.map((user) => (
                          <TableRow key={user._id} className='border-border transition-colors'>
                            {/* Avatar + name */}
                            <TableCell className='py-4 pl-6'>
                              <div className='flex items-center gap-4'>
                                <Avatar className='h-10 w-10 border border-border shadow-sm'>
                                  <AvatarImage src={user.avatar ?? undefined} alt={user.displayName} />
                                  <AvatarFallback className='bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 text-sm font-semibold'>
                                    {user.displayName?.charAt(0)?.toUpperCase() ?? '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className='font-medium text-sm'>{user.displayName}</div>
                                  <div className='text-xs text-muted-foreground'>{user.email}</div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className='py-4'>{getRoleBadge(user.role)}</TableCell>

                            <TableCell className='py-4'>
                              {user.isActive ? (
                                <div className='flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400'>
                                  <ShieldCheck className='h-4 w-4' />
                                  <span className='text-sm font-medium'>Hoạt động</span>
                                </div>
                              ) : (
                                <div className='flex items-center gap-1.5 text-rose-500'>
                                  <Ban className='h-4 w-4' />
                                  <span className='text-sm font-medium'>Bị khóa</span>
                                </div>
                              )}
                            </TableCell>

                            <TableCell className='py-4'>
                              {user.isSubscriptionActive ? (
                                <Badge className='rounded-lg px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'>
                                  VIP
                                </Badge>
                              ) : (
                                <div className='flex items-center gap-1.5 text-muted-foreground'>
                                  <Clock className='h-3.5 w-3.5' />
                                  <span className='text-xs'>Chưa có</span>
                                </div>
                              )}
                            </TableCell>

                            <TableCell className='py-4 text-sm text-muted-foreground'>
                              {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                            </TableCell>

                            {/* Actions */}
                            <TableCell className='py-4 pr-6 text-right'>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant='ghost' className='h-8 w-8 p-0 rounded-full'>
                                    <span className='sr-only'>Mở menu</span>
                                    <MoreHorizontal className='h-5 w-5' />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end' className='w-52 rounded-2xl p-2'>
                                  <DropdownMenuLabel className='text-xs font-medium text-muted-foreground px-2'>
                                    Hành động
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />

                                  {/* Xem chi tiết */}
                                  <DropdownMenuItem
                                    className='p-2.5 rounded-xl cursor-pointer gap-2'
                                    onClick={() => openDetail(user._id)}
                                  >
                                    <Eye className='h-4 w-4' />
                                    <span>Xem chi tiết</span>
                                  </DropdownMenuItem>

                                  {/* Gửi thông báo */}
                                  <DropdownMenuItem className='p-2.5 rounded-xl cursor-pointer gap-2'>
                                    <Mail className='h-4 w-4' />
                                    <span>Gửi thông báo</span>
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  {/* Ban / Unban */}
                                  <DropdownMenuItem
                                    className={`p-2.5 rounded-xl cursor-pointer gap-2 ${user.isActive ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                                    onClick={() => openBan(user)}
                                  >
                                    {user.isActive
                                      ? <><UserX className='h-4 w-4' /><span>Khóa tài khoản</span></>
                                      : <><UserCheck className='h-4 w-4' /><span>Mở khóa</span></>
                                    }
                                  </DropdownMenuItem>

                                  {/* Xóa */}
                                  <DropdownMenuItem
                                    className='p-2.5 rounded-xl cursor-pointer gap-2 text-destructive focus:text-destructive'
                                    onClick={() => openDelete(user)}
                                  >
                                    <Trash2 className='h-4 w-4' />
                                    <span>Xóa tài khoản</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className='flex items-center justify-between border-t px-6 py-4'>
                  <p className='text-sm text-muted-foreground'>
                    Trang <span className='font-medium text-foreground'>{page}</span> / {totalPages}
                  </p>
                  <div className='flex items-center gap-2'>
                    <Button
                      size='sm' variant='outline' className='h-8 w-8 p-0 rounded-xl'
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className='size-4' />
                    </Button>
                    <Button
                      size='sm' variant='outline' className='h-8 w-8 p-0 rounded-xl'
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className='size-4' />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Dialogs ── */}

      {/* Detail */}
      <UserDetailDialog
        userId={detailId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {/* Ban / Unban confirm */}
      <ConfirmDialog
        open={banOpen}
        onOpenChange={setBanOpen}
        title={banTarget?.isActive ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?'}
        description={
          banTarget?.isActive
            ? `Tài khoản "${banTarget?.displayName}" sẽ bị khóa và không thể đăng nhập.`
            : `Tài khoản "${banTarget?.displayName}" sẽ được mở khóa trở lại.`
        }
        confirmLabel={banTarget?.isActive ? 'Khóa' : 'Mở khóa'}
        confirmVariant={banTarget?.isActive ? 'destructive' : 'default'}
        loading={banLoading}
        onConfirm={handleBanConfirm}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='Xóa tài khoản vĩnh viễn?'
        description={`Hành động này không thể hoàn tác. Tài khoản "${deleteTarget?.displayName}" sẽ bị xóa khỏi hệ thống.`}
        confirmLabel='Xóa vĩnh viễn'
        confirmVariant='destructive'
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
