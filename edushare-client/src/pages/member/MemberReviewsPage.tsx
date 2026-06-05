import { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  MessageSquareText,
  Search,
  Star,
  Clock3,
  User as UserIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { fetchClient } from '@/utils/fetchClient'

// ─── Types ──────────────────────────────────────────────────────────────────────

interface RatingSender {
  _id: string
  email: string
  displayName: string
  avatar: string | null
}

interface RatingItem {
  _id: string
  senderId: RatingSender
  receiverId: RatingSender
  transactionId: string
  rating: number
  comment: string | null
  createdAt: string
  updatedAt: string
}

interface RatingsResponse {
  list: RatingItem[]
  totalPages: number
  totalItems: number
}

// ─── Components ─────────────────────────────────────────────────────────────────

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'md' ? 'size-5' : 'size-4'
  return (
    <div className='flex gap-0.5'>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  )
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div className='flex items-center gap-3'>
      <span className='w-12 text-sm font-medium'>{label}</span>
      <div className='h-2 flex-1 overflow-hidden rounded-full bg-secondary'>
        <div
          className='h-full rounded-full bg-yellow-400 transition-all duration-500'
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className='w-8 text-right text-sm text-muted-foreground'>{count}</span>
    </div>
  )
}

function ReviewCard({
  item,
  activeTab,
}: {
  item: RatingItem
  activeTab: 'received' | 'sent'
}) {
  const member = activeTab === 'received' ? item.senderId : item.receiverId
  const memberName = member?.displayName || 'Thành viên'
  const initials = memberName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const timeAgo = getRelativeTime(item.createdAt)

  return (
    <div className='group relative rounded-xl border bg-card p-5 transition-colors hover:bg-accent/30'>
      {/* Header: Avatar + Name + Stars + Time */}
      <div className='flex items-start gap-4'>
        <Avatar className='size-10 border'>
          {member?.avatar && <AvatarImage src={member.avatar} alt={memberName} />}
          <AvatarFallback className='text-xs font-semibold bg-primary/10 text-primary'>
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-2 min-w-0'>
              <span className='font-semibold text-sm truncate'>{memberName}</span>
              <Badge variant='secondary' className='rounded-full text-[10px] px-2 py-0 shrink-0'>
                {activeTab === 'received' ? 'Người gửi' : 'Người nhận'}
              </Badge>
            </div>
            <div className='flex items-center gap-1.5 text-xs text-muted-foreground shrink-0'>
              <Clock3 className='size-3' />
              <span>{timeAgo}</span>
            </div>
          </div>

          {/* Star Rating */}
          <div className='mt-1.5 flex items-center gap-2'>
            <StarRating rating={item.rating} />
            <span className='text-xs font-medium text-muted-foreground'>{item.rating}.0</span>
          </div>

          {/* Comment */}
          <div className='mt-3'>
            {item.comment ? (
              <p className='text-sm leading-relaxed text-foreground/90'>{item.comment}</p>
            ) : (
              <p className='text-sm italic text-muted-foreground'>Không để lại lời nhắn</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getRelativeTime(iso: string) {
  const now = new Date()
  const date = new Date(iso)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 1) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`
  if (diffHour < 24) return `${diffHour} giờ trước`
  if (diffDay < 7) return `${diffDay} ngày trước`

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function MemberReviewsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [trustScore, setTrustScore] = useState<number>(5.0)
  const [ratings, setRatings] = useState<RatingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemPerPage = 10

  // Fetch trust score
  const fetchTrustScore = async () => {
    try {
      const res = await fetchClient('/users/me')
      if (res && res.trustScore !== undefined) {
        setTrustScore(res.trustScore)
      }
    } catch (error) {
      console.error('Failed to load trust score:', error)
    }
  }

  // Fetch ratings list
  const fetchRatings = async () => {
    setLoading(true)
    try {
      const type = activeTab === 'received' ? 'received' : 'sent'
      const res: RatingsResponse = await fetchClient(
        `/ratings/me?type=${type}&page=${page}&itemPerPage=${itemPerPage}`
      )
      setRatings(res.list ?? [])
      setTotalPages(res.totalPages ?? 1)
      setTotalItems(res.totalItems ?? 0)
    } catch (error) {
      console.error('Failed to load ratings:', error)
      setRatings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrustScore()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [activeTab])

  useEffect(() => {
    fetchRatings()
  }, [activeTab, page])

  const stats = useMemo(() => {
    const total = totalItems
    const average =
      ratings.length > 0
        ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
        : trustScore.toFixed(1)

    return {
      total,
      averageRating: average,
      fiveStar: ratings.filter((r) => r.rating === 5).length,
      fourStar: ratings.filter((r) => r.rating === 4).length,
      threeStar: ratings.filter((r) => r.rating === 3).length,
      twoStar: ratings.filter((r) => r.rating === 2).length,
      oneStar: ratings.filter((r) => r.rating === 1).length,
    }
  }, [ratings, trustScore, totalItems])

  const filteredReviews = useMemo(() => {
    return ratings.filter((review) => {
      const matchesRating = ratingFilter === 'all' || review.rating === Number(ratingFilter)

      const query = searchQuery.toLowerCase()
      const comment = review.comment?.toLowerCase() ?? ''
      const senderName = review.senderId?.displayName?.toLowerCase() ?? ''
      const receiverName = review.receiverId?.displayName?.toLowerCase() ?? ''

      const matchesSearch =
        comment.includes(query) || senderName.includes(query) || receiverName.includes(query)

      return matchesRating && matchesSearch
    })
  }, [ratings, ratingFilter, searchQuery])

  return (
    <div className='space-y-6'>
      {/* Hero Header */}
      <Card>
        <CardContent className='p-6'>
          <Badge className='rounded-full' variant='outline'>
            Reviews
          </Badge>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight'>Đánh giá & Xếp hạng</h2>
          <p className='mt-2 max-w-2xl text-sm text-muted-foreground'>
            Quản lý đánh giá từ các giao dịch của bạn với hệ thống Shadcn nguyên bản.
          </p>
        </CardContent>
      </Card>

      {/* Stats + Filter Grid */}
      <div className='grid gap-6 lg:grid-cols-[1fr_1fr]'>
        {/* Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tổng quan đánh giá</CardTitle>
            <CardDescription>Thống kê nhanh phản hồi và điểm uy tín cá nhân.</CardDescription>
          </CardHeader>
          <CardContent className='grid gap-6 lg:grid-cols-2'>
            <div className='text-center lg:text-left'>
              <div className='mb-2 flex items-end justify-center gap-2 lg:justify-start'>
                <span className='text-5xl font-bold'>{stats.averageRating}</span>
                <span className='mb-2 text-muted-foreground'>/ 5.0</span>
              </div>
              <div className='mb-2 flex justify-center lg:justify-start'>
                <StarRating rating={Math.round(Number(stats.averageRating))} size='md' />
              </div>
              <p className='text-sm text-muted-foreground'>
                Dựa trên {stats.total} đánh giá gần đây
              </p>
            </div>

            <div className='space-y-2'>
              <RatingBar label='5 sao' count={stats.fiveStar} total={ratings.length} />
              <RatingBar label='4 sao' count={stats.fourStar} total={ratings.length} />
              <RatingBar label='3 sao' count={stats.threeStar} total={ratings.length} />
              <RatingBar label='2 sao' count={stats.twoStar} total={ratings.length} />
              <RatingBar label='1 sao' count={stats.oneStar} total={ratings.length} />
            </div>
          </CardContent>
        </Card>

        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle>Bộ lọc tìm kiếm</CardTitle>
            <CardDescription>Tìm và lọc đánh giá theo nội dung hoặc số sao.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Tìm kiếm đánh giá...'
                className='pl-10 pr-4'
              />
            </div>

            <div className='flex flex-wrap gap-2'>
              <Button
                variant={activeTab === 'received' ? 'default' : 'outline'}
                className='rounded-full'
                onClick={() => setActiveTab('received')}
              >
                Đánh giá nhận được
              </Button>
              <Button
                variant={activeTab === 'sent' ? 'default' : 'outline'}
                className='rounded-full'
                onClick={() => setActiveTab('sent')}
              >
                Đánh giá đã gửi
              </Button>
            </div>

            <div className='relative'>
              <Filter className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className='pl-10 pr-4'>
                  <SelectValue placeholder='Lọc theo số sao' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tất cả sao</SelectItem>
                  <SelectItem value='5'>5 sao</SelectItem>
                  <SelectItem value='4'>4 sao</SelectItem>
                  <SelectItem value='3'>3 sao</SelectItem>
                  <SelectItem value='2'>2 sao</SelectItem>
                  <SelectItem value='1'>1 sao</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <MessageSquareText className='size-5' />
                Lịch sử đánh giá
              </CardTitle>
              <CardDescription className='mt-1'>
                {activeTab === 'received'
                  ? 'Danh sách phản hồi từ các thành viên khác dành cho bạn.'
                  : 'Danh sách đánh giá bạn đã gửi cho các chủ nhóm.'}
              </CardDescription>
            </div>
            {!loading && (
              <Badge variant='outline' className='rounded-full'>
                {totalItems} đánh giá
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading skeleton */}
          {loading && (
            <div className='space-y-4'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='animate-pulse rounded-xl border p-5'>
                  <div className='flex items-start gap-4'>
                    <div className='size-10 rounded-full bg-muted' />
                    <div className='flex-1 space-y-3'>
                      <div className='flex items-center justify-between'>
                        <div className='h-4 w-28 rounded bg-muted' />
                        <div className='h-3 w-20 rounded bg-muted' />
                      </div>
                      <div className='h-3 w-24 rounded bg-muted' />
                      <div className='space-y-2'>
                        <div className='h-3 w-full rounded bg-muted' />
                        <div className='h-3 w-3/4 rounded bg-muted' />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredReviews.length === 0 && (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <div className='mb-4 rounded-full bg-muted p-4'>
                <MessageSquareText className='size-8 text-muted-foreground' />
              </div>
              <p className='font-semibold text-foreground'>Không tìm thấy đánh giá phù hợp</p>
              <p className='mt-1 text-sm text-muted-foreground'>
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          )}

          {/* Review cards */}
          {!loading && filteredReviews.length > 0 && (
            <div className='space-y-3'>
              {filteredReviews.map((item) => (
                <ReviewCard key={item._id} item={item} activeTab={activeTab} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className='mt-6 flex items-center justify-between border-t pt-4'>
              <p className='text-sm text-muted-foreground'>
                Trang {page} / {totalPages} · Tổng {totalItems} đánh giá
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
        </CardContent>
      </Card>
    </div>
  )
}
