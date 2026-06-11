import { MoreHorizontal, ShieldCheck, Clock, Mail, LifeBuoy, Ban, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

const ITEMS_PER_PAGE = 10

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'guest' | 'member' | 'admin'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(() => {
    setLoading(true)
    setError(null)
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
      .catch(() => setError('Không thể tải danh sách người dùng.'))
      .finally(() => setLoading(false))
  }, [page, search, roleFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Search debounce — chỉ gọi API khi bấm Enter hoặc click nút tìm
  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput)
  }

  const handleRoleChange = (val: string) => {
    setRoleFilter(val as typeof roleFilter)
    setPage(1)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className='space-y-6'>
      {/* Hero */}
      <Card>
        <CardContent>
          <Badge className='rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-300'>Users</Badge>
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
              {/* Search */}
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

              {/* Role filter */}
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
          {/* Error state */}
          {error ? (
            <div className='flex flex-col items-center justify-center gap-3 py-16'>
              <p className='text-sm text-destructive'>{error}</p>
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
                      <TableHead className='py-4 font-medium'>Trạng thái tài khoản</TableHead>
                      <TableHead className='py-4 font-medium'>Subscription</TableHead>
                      <TableHead className='py-4 font-medium'>Ngày tạo</TableHead>
                      <TableHead className='py-4 pr-6 text-right font-medium'>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      // Skeleton rows
                      Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
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
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className='py-16 text-center text-sm text-muted-foreground'>
                          Không tìm thấy người dùng nào.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user._id} className='border-border transition-colors'>
                          {/* Avatar + name + email */}
                          <TableCell className='py-4 pl-6'>
                            <div className='flex items-center gap-4'>
                              <Avatar className='h-10 w-10 border border-border shadow-sm'>
                                <AvatarImage src={user.avatar} alt={user.displayName} />
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

                          {/* Role */}
                          <TableCell className='py-4'>{getRoleBadge(user.role)}</TableCell>

                          {/* isActive */}
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

                          {/* Subscription */}
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

                          {/* Created at */}
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
                              <DropdownMenuContent align='end' className='w-48 rounded-2xl p-2'>
                                <DropdownMenuLabel className='text-xs font-medium text-muted-foreground'>Hành động</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className='p-2.5 rounded-xl cursor-pointer text-sky-700 dark:text-sky-400'>
                                  <LifeBuoy className='mr-2 h-4 w-4' />
                                  <span>Hỗ trợ người dùng</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className='p-2.5 rounded-xl cursor-pointer'>
                                  <Mail className='mr-2 h-4 w-4' />
                                  <span>Gửi thông báo</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className='p-2.5 rounded-xl cursor-pointer text-amber-700 dark:text-amber-400'>
                                  <Ban className='mr-2 h-4 w-4' />
                                  <span>{user.isActive ? 'Khóa tài khoản' : 'Mở khóa'}</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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
                      size='sm'
                      variant='outline'
                      className='h-8 w-8 p-0 rounded-xl'
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className='size-4' />
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      className='h-8 w-8 p-0 rounded-xl'
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
    </div>
  )
}
