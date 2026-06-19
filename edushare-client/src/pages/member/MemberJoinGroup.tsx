import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { fetchClient } from '@/utils/fetchClient'
import { ArrowDown, ArrowUp, ArrowUpDown,  Loader2, Search, Star, UserRound, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useNavigate } from 'react-router-dom'

interface GroupMember {
  _id: string
  email?: string
  displayName?: string
}

interface GroupOwner {
  _id?: string
  id?: string
  username?: string
  displayName?: string
  avatar?: string | null
  trustScore?: number
}

interface Group {
  _id: string
  name: string
  description?: string
  category: string
  totalSlots: number
  occupiedSlots: number
  totalPrice: number
  price: number
  status: string
  ownerId: GroupOwner | string
  members?: GroupMember[] | string[]
  expiredAt: string | null
  createdAt?: string
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'available', label: 'Có sẵn' },
  { value: 'full', label: 'Đã đủ' },
  { value: 'expired', label: 'Hết hạn' },
  { value: 'closed', label: 'Đã đóng' },
]

const STATUS_LABEL: Record<string, string> = {
  available: 'Có sẵn',
  full: 'Đã đủ',
  expired: 'Hết hạn',
  closed: 'Đã đóng',
  hidden: 'Đã ẩn',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  available: 'default',
  full: 'secondary',
  expired: 'outline',
  closed: 'destructive',
  hidden: 'outline',
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value || 0)}đ`
}

function getOwnerName(owner: Group['ownerId']) {
  if (typeof owner === 'string') return 'Chủ nhóm'
  return owner.displayName || owner.username || 'Chủ nhóm'
}

function getOwnerTrustScore(owner: Group['ownerId']) {
  if (typeof owner === 'string') return null
  return typeof owner.trustScore === 'number' ? owner.trustScore : null
}

function isCurrentUserInGroup(group: Group, userId?: string) {
  if (!userId) return false
  return (group.members ?? []).some((member) => {
    if (typeof member === 'string') return member === userId
    return member._id === userId
  })
}

export default function MemberJoinGroup() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [groups, setGroups] = useState<Group[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('available')
  const [priceOrder, setPriceOrder] = useState<'asc' | 'desc' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchClient('/groups', { method: 'GET', requireAuth: true })
      const data = response.data ?? response.list
      setGroups(Array.isArray(data) ? data : [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách nhóm'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(fetchGroups)
  }, [fetchGroups])

  const visibleGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const userId = user?.userID

    return groups
      .filter((group) => {
        const ownerId = typeof group.ownerId === 'string' ? group.ownerId : group.ownerId._id || group.ownerId.id
        if (ownerId === userId) return false
        if (isCurrentUserInGroup(group, userId)) return false
        if (statusFilter !== 'all' && group.status !== statusFilter) return false
        if (!normalizedQuery) return true

        return [group.name, group.description, group.category, getOwnerName(group.ownerId)]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery))
      })
      .sort((a, b) => {
        if (priceOrder === 'asc') return (a.price || 0) - (b.price || 0)
        if (priceOrder === 'desc') return (b.price || 0) - (a.price || 0)
        return (getOwnerTrustScore(b.ownerId) ?? -1) - (getOwnerTrustScore(a.ownerId) ?? -1)
      })
  }, [groups, priceOrder, query, statusFilter, user?.userID])

  return (
    <div className='space-y-6'>
      <Card>
        <CardContent>
          <Badge variant='secondary' className='rounded-full'>
            Join Group
          </Badge>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight'>Gia nhập nhóm</h2>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-muted-foreground'>
            Khám phá các nhóm đang còn slot, xem trust score và thông tin chủ nhóm trước khi tham gia.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-4 md:p-5'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center'>
            <div className='relative w-full md:max-w-sm'>
              <Search className='pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder='Tìm nhóm, danh mục hoặc chủ nhóm...'
                className='h-11 pl-11'
              />
            </div>

            <div className='w-full md:w-52'>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='!h-11 w-full px-4'>
                  <SelectValue placeholder='Lọc trạng thái' />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant={priceOrder ? 'secondary' : 'outline'}
              className='h-11 px-4'
              onClick={() => setPriceOrder((current) => (current === null ? 'asc' : current === 'asc' ? 'desc' : null))}
            >
              {priceOrder === 'asc' ? (
                <ArrowUp className='mr-2 size-4' />
              ) : priceOrder === 'desc' ? (
                <ArrowDown className='mr-2 size-4' />
              ) : (
                <ArrowUpDown className='mr-2 size-4' />
              )}
              Giá {priceOrder === 'asc' ? '↑ Tăng dần' : priceOrder === 'desc' ? '↓ Giảm dần' : 'tiền'}
            </Button>

            {loading && (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Loader2 className='size-4 animate-spin' />
                Đang tải...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && <div className='rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive'>{error}</div>}

      {!loading && visibleGroups.length === 0 && !error ? (
        <div className='flex flex-col items-center justify-center border border-dashed py-16'>
          <Users className='size-12 text-muted-foreground/40' />
          <p className='mt-3 text-sm font-medium text-muted-foreground'>Chưa có nhóm phù hợp để tham gia.</p>
          <p className='mt-1 text-xs text-muted-foreground'>Hãy thử đổi bộ lọc hoặc quay lại sau.</p>
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className='animate-pulse rounded-lg'>
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
            : visibleGroups.map((group) => {
                const progress = Math.round((group.occupiedSlots / group.totalSlots) * 100)
                const slotsLeft = Math.max(group.totalSlots - group.occupiedSlots, 0)
                const trustScore = getOwnerTrustScore(group.ownerId)

                return (
                  <Card key={group._id} className='border transition hover:shadow-md'>
                    <CardHeader className='space-y-4'>
                      <div className='flex items-start justify-between gap-4'>
                        <div>
                          <CardTitle className='text-xl'>{group.name}</CardTitle>
                          <CardDescription className='mt-1 text-sm'>
                            {group.occupiedSlots}/{group.totalSlots} thành viên • {group.category}
                          </CardDescription>
                        </div>
                        <Badge variant={STATUS_VARIANTS[group.status] ?? 'outline'} className='rounded-full'>
                          {STATUS_LABEL[group.status] ?? group.status}
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
                      {group.description && <p className='line-clamp-2 text-sm text-muted-foreground'>{group.description}</p>}

                      <div className='grid grid-cols-2 gap-3 text-sm'>
                        <div className='border p-3'>
                          <p className='text-xs text-muted-foreground'>Slot còn lại</p>
                          <p className='mt-1 font-semibold'>{slotsLeft} slot</p>
                        </div>
                        <div className='border p-3'>
                          <p className='text-xs text-muted-foreground'>Giá / slot</p>
                          <p className='mt-1 font-semibold'>{formatCurrency(group.price)}</p>
                        </div>
                        <div className='border p-3'>
                          <p className='flex items-center gap-1 text-xs text-muted-foreground'>
                            <Star className='size-3.5' /> Trust score
                          </p>
                          <p className='mt-1 font-semibold'>{trustScore !== null ? `${trustScore}/5` : 'Chưa có'}</p>
                        </div>
                        <div className='border p-3'>
                          <p className='flex items-center gap-1 text-xs text-muted-foreground'>
                            <UserRound className='size-3.5' /> Chủ nhóm
                          </p>
                          <p className='mt-1 truncate font-semibold'>{getOwnerName(group.ownerId)}</p>
                        </div>
                      </div>

                      <Button
                        className='w-full rounded-md'
                        onClick={() => navigate(`/dashboard/participant/${group._id}`)}
                      >
                        Xem chi tiết
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
        </div>
      )}
    </div>
  )
}


