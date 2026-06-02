import { useEffect, useMemo, useState } from 'react'
import { Filter, Search, Star, Clock3, User as UserIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { fetchClient } from '@/utils/fetchClient'

interface RatingItem {
  _id: string
  senderId: { _id: string; username: string; email: string }
  receiverId: { _id: string; username: string; email: string }
  transactionId: {
    _id: string
    groupId: { _id: string; name: string } | null
  } | null
  rating: number
  comment: string | null
  createdAt: string
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className='flex gap-0.5 justify-center lg:justify-start'>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
        />
      ))}
    </div>
  )
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div className='flex items-center gap-3'>
      <span className='w-12 text-sm'>{label}</span>
      <div className='h-2 flex-1 overflow-hidden rounded-full bg-secondary'>
        <div className='h-full rounded-full bg-yellow-400' style={{ width: `${percentage}%` }} />
      </div>
      <span className='w-8 text-right text-sm'>{count}</span>
    </div>
  )
}

export default function MemberReviewsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [trustScore, setTrustScore] = useState<number>(5.0)
  const [ratings, setRatings] = useState<RatingItem[]>([])
  const [loading, setLoading] = useState(true)

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

  // Fetch ratings list based on tab
  const fetchRatings = async () => {
    if (!user?.userID) return
    setLoading(true)
    try {
      const queryParam = activeTab === 'received' ? `receiverId=${user.userID}` : `senderId=${user.userID}`
      const res = await fetchClient(`/ratings?${queryParam}`)
      setRatings(Array.isArray(res) ? res : [])
    } catch (error) {
      console.error('Failed to load ratings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrustScore()
  }, [])

  useEffect(() => {
    fetchRatings()
  }, [activeTab, user?.userID])

  const stats = useMemo(() => {
    const total = ratings.length
    const average = total > 0 ? (ratings.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) : trustScore.toFixed(1)

    return {
      total,
      averageRating: average,
      fiveStar: ratings.filter((r) => r.rating === 5).length,
      fourStar: ratings.filter((r) => r.rating === 4).length,
      threeStar: ratings.filter((r) => r.rating === 3).length,
      twoStar: ratings.filter((r) => r.rating === 2).length,
      oneStar: ratings.filter((r) => r.rating === 1).length,
    }
  }, [ratings, trustScore])

  const filteredReviews = useMemo(() => {
    return ratings.filter((review) => {
      const matchesRating = ratingFilter === 'all' || review.rating === Number(ratingFilter)
      
      const query = searchQuery.toLowerCase()
      const groupName = review.transactionId?.groupId?.name?.toLowerCase() ?? ''
      const comment = review.comment?.toLowerCase() ?? ''
      const senderName = review.senderId?.username?.toLowerCase() ?? ''
      const receiverName = review.receiverId?.username?.toLowerCase() ?? ''
      
      const matchesSearch = 
        groupName.includes(query) || 
        comment.includes(query) || 
        senderName.includes(query) || 
        receiverName.includes(query)

      return matchesRating && matchesSearch
    })
  }, [ratings, ratingFilter, searchQuery])

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardContent className='p-6'>
          <Badge className='rounded-full' variant='outline'>Reviews</Badge>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight'>Đánh giá & Xếp hạng</h2>
          <p className='mt-2 max-w-2xl text-sm text-muted-foreground'>
            Quản lý đánh giá từ các giao dịch của bạn với hệ thống Shadcn nguyên bản.
          </p>
        </CardContent>
      </Card>

      <div className='grid gap-6 lg:grid-cols-[1fr_1fr]'>
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
                <StarRating rating={Math.round(Number(stats.averageRating))} />
              </div>
              <p className='text-sm text-muted-foreground'>Dựa trên {stats.total} đánh giá gần đây</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử đánh giá</CardTitle>
          <CardDescription>
            {activeTab === 'received' ? 'Danh sách phản hồi từ các thành viên khác dành cho bạn.' : 'Danh sách đánh giá bạn đã gửi cho các chủ nhóm.'}
          </CardDescription>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='overflow-hidden rounded-lg border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[160px]'>Thành viên</TableHead>
                  <TableHead className='w-[140px] text-center'>Đánh giá</TableHead>
                  <TableHead className='w-[150px]'>Tên nhóm</TableHead>
                  <TableHead>Lời nhắn</TableHead>
                  <TableHead className='w-[160px] text-right'>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className='h-24 text-center text-muted-foreground'>
                      Đang tải danh sách đánh giá...
                    </TableCell>
                  </TableRow>
                ) : filteredReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='h-24 text-center text-muted-foreground'>
                      Không tìm thấy đánh giá phù hợp
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReviews.map((item) => {
                    const memberName = activeTab === 'received' 
                      ? (item.senderId?.username || 'Thành viên')
                      : (item.receiverId?.username || 'Chủ nhóm')
                    const softwareName = item.transactionId?.groupId?.name ?? 'N/A'

                    return (
                      <TableRow key={item._id}>
                        <TableCell className='font-medium'>
                          <div className='flex items-center gap-2'>
                            <UserIcon className='size-4 text-muted-foreground' />
                            {memberName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex justify-center'>
                            <StarRating rating={item.rating} />
                          </div>
                        </TableCell>
                        <TableCell className='font-semibold text-indigo-600'>
                          {softwareName}
                        </TableCell>
                        <TableCell className='break-all max-w-[320px]'>
                          {item.comment || <span className='text-muted-foreground italic'>Không để lại lời nhắn</span>}
                        </TableCell>
                        <TableCell className='text-right text-xs text-muted-foreground'>
                          <div className='flex items-center justify-end gap-1'>
                            <Clock3 className='size-3.5' />
                            {formatDate(item.createdAt)}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
