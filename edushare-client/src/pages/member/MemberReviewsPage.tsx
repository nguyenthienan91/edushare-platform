import { useMemo, useState } from 'react'
import { Filter, MessageSquare, Search, Star, ThumbsUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Review {
  id: string
  orderId: string
  platform: string
  rating: number
  comment: string
  reviewerName: string
  reviewerRole: 'owner' | 'participant'
  date: string
  helpful: number
  canRespond: boolean
  response?: string
}

const reviewsData: Review[] = [
  {
    id: '1',
    orderId: 'ORD-001',
    platform: 'Netflix Premium',
    rating: 5,
    comment: 'Chủ sở hữu rất uy tín và hỗ trợ nhanh chóng.',
    reviewerName: 'Nguyễn Văn A',
    reviewerRole: 'participant',
    date: '2026-05-15',
    helpful: 12,
    canRespond: true,
  },
  {
    id: '2',
    orderId: 'ORD-002',
    platform: 'Spotify Family',
    rating: 4,
    comment: 'Thanh toán đúng hạn, giao dịch ổn định.',
    reviewerName: 'Trần Thị B',
    reviewerRole: 'owner',
    date: '2026-05-14',
    helpful: 5,
    canRespond: false,
    response: 'Cảm ơn bạn rất nhiều!',
  },
  {
    id: '3',
    orderId: 'ORD-003',
    platform: 'ChatGPT Plus',
    rating: 5,
    comment: 'Rất tuyệt vời, sẽ tiếp tục tham gia.',
    reviewerName: 'Lê Văn C',
    reviewerRole: 'participant',
    date: '2026-05-10',
    helpful: 15,
    canRespond: true,
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className='flex gap-0.5'>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
        />
      ))}
    </div>
  )
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div className='flex items-center gap-3'>
      <span className='w-12 text-sm '>{label}</span>
      <div className='h-2 flex-1 overflow-hidden rounded-full bg-slate-100'>
        <div className='h-full rounded-full bg-yellow-400' style={{ width: `${percentage}%` }} />
      </div>
      <span className='w-8 text-right text-sm '>{count}</span>
    </div>
  )
}

export default function MemberReviewsPage() {
  const currentUser = { role: 'participant' as const }
  const [filter, setFilter] = useState<'all' | 'received' | 'given'>('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => {
    const total = reviewsData.length
    const averageRating = total > 0 ? (reviewsData.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) : '0.0'

    return {
      total,
      averageRating,
      fiveStar: reviewsData.filter((r) => r.rating === 5).length,
      fourStar: reviewsData.filter((r) => r.rating === 4).length,
      threeStar: reviewsData.filter((r) => r.rating === 3).length,
      twoStar: reviewsData.filter((r) => r.rating === 2).length,
      oneStar: reviewsData.filter((r) => r.rating === 1).length,
    }
  }, [])

  const filteredReviews = reviewsData.filter((review) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'received'
          ? review.reviewerRole !== currentUser.role
          : review.reviewerRole === currentUser.role

    const matchesRating = ratingFilter === 'all' || review.rating === Number(ratingFilter)
    const query = searchQuery.toLowerCase()
    const matchesSearch = review.platform.toLowerCase().includes(query) || review.comment.toLowerCase().includes(query)

    return matchesFilter && matchesRating && matchesSearch
  })

  return (
    <div
     
    >
      <div className='space-y-6'>
        <Card>
          <CardContent>
            <Badge className='rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-100'>Reviews</Badge>
            <h2 className='mt-3 text-3xl font-semibold tracking-tight '>Đánh giá & Xếp hạng</h2>
            <p className='mt-2 max-w-2xl text-sm leading-6 '>Quản lý đánh giá từ giao dịch của bạn với giao diện thống nhất theo design system của member pages.</p>
          </CardContent>
        </Card>

        <div className='grid gap-6 lg:grid-cols-[1.05fr_0.95fr]'>
          <Card>
            <CardHeader>
              <CardTitle className=''>Tổng quan đánh giá</CardTitle>
              <CardDescription>Thống kê nhanh chất lượng phản hồi và mức độ hài lòng.</CardDescription>
            </CardHeader>
            <CardContent className='grid gap-6 lg:grid-cols-2'>
              <div className='text-center lg:text-left'>
                <div className='mb-2 flex items-end justify-center gap-2 lg:justify-start'>
                  <span className='text-5xl font-bold '>{stats.averageRating}</span>
                  <span className='mb-2 '>/ 5.0</span>
                </div>
                <div className='mb-2 flex justify-center lg:justify-start'>
                  <StarRating rating={Math.round(Number(stats.averageRating))} />
                </div>
                <p className=''>Dựa trên {stats.total} đánh giá</p>
              </div>

              <div className='space-y-2'>
                <RatingBar label='5 sao' count={stats.fiveStar} total={stats.total} />
                <RatingBar label='4 sao' count={stats.fourStar} total={stats.total} />
                <RatingBar label='3 sao' count={stats.threeStar} total={stats.total} />
                <RatingBar label='2 sao' count={stats.twoStar} total={stats.total} />
                <RatingBar label='1 sao' count={stats.oneStar} total={stats.total} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className=''>Bộ lọc</CardTitle>
              <CardDescription>Tìm và lọc đánh giá theo nội dung, loại sao và trạng thái.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400' />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Tìm kiếm đánh giá...'
                  className='h-12 rounded-2xl border-slate-200  pl-10 pr-4'
                />
              </div>

              <div className='flex flex-wrap gap-2'>
                <Button variant={filter === 'all' ? 'default' : 'outline'} className='rounded-full' onClick={() => setFilter('all')}>
                  Tất cả
                </Button>
                <Button variant={filter === 'received' ? 'default' : 'outline'} className='rounded-full' onClick={() => setFilter('received')}>
                  Nhận được
                </Button>
                <Button variant={filter === 'given' ? 'default' : 'outline'} className='rounded-full' onClick={() => setFilter('given')}>
                  Đã cho
                </Button>
              </div>

              <div className='relative'>
                <Filter className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400' />
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className='h-12 rounded-2xl border-slate-200  pl-10 pr-4'>
                    <SelectValue placeholder='Lọc theo số sao' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tất cả</SelectItem>
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

        <div className='space-y-4'>
          {filteredReviews.length === 0 ? (
            <Card>
              <CardContent className='py-12 text-center'>
                <Star className='mx-auto mb-3 size-12 text-slate-300' />
                <p className='mb-1 font-medium '>Không có đánh giá</p>
                <p className='text-sm '>Không tìm thấy đánh giá phù hợp</p>
              </CardContent>
            </Card>
          ) : (
            filteredReviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex items-start gap-4'>
                      <div className='flex size-11 items-center justify-center rounded-2xl bg-indigo-100 font-semibold text-indigo-700'>
                        {review.reviewerName.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className='text-lg '>{review.reviewerName}</CardTitle>
                        <CardDescription className='mt-1'>Đơn hàng: {review.orderId}</CardDescription>
                        <div className='mt-2 flex flex-wrap gap-2'>
                          <Badge variant='secondary' className='rounded-full'>
                            {review.reviewerRole === 'owner' ? 'Chủ sở hữu' : 'Người tham gia'}
                          </Badge>
                          <Badge variant='outline' className='rounded-full'>
                            {review.platform}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className='text-right'>
                      <StarRating rating={review.rating} />
                      <p className='mt-1 text-xs '>{review.date}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <p className='text-sm leading-6 '>{review.comment}</p>

                  {review.response && (
                    <div className='rounded-2xl border border-slate-100  p-4'>
                      <p className='mb-1 text-xs font-semibold '>Phản hồi từ bạn:</p>
                      <p className='text-sm '>{review.response}</p>
                    </div>
                  )}

                  <div className='flex items-center justify-between border-t border-slate-100 pt-4'>
                    <Button variant='ghost' className='rounded-full  hover:text-indigo-600'>
                      <ThumbsUp className='size-4' />
                      Hữu ích ({review.helpful})
                    </Button>

                    {review.canRespond && !review.response && (
                      <Button variant='outline' className='rounded-full'>
                        <MessageSquare className='size-4' />
                        Phản hồi
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
