import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { fetchClient } from '@/utils/fetchClient'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  DollarSign,
  Info,
  Loader2,
  Lock,
  ShieldCheck,
  Star,
  UserRound,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

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

interface RatingSender {
  _id: string
  displayName?: string
  avatar?: string | null
}

interface RatingItem {
  _id: string
  senderId: RatingSender | string | null
  rating: number
  comment?: string | null
  createdAt: string
}

interface OwnerRatingsResponse {
  averageRating: number
  totalRatings: number
  list: RatingItem[]
  totalPages: number
  totalItems: number
}

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

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return 'Không giới hạn'
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function getOwnerName(owner: Group['ownerId'] | undefined) {
  if (!owner) return 'Chủ nhóm'
  if (typeof owner === 'string') return 'Chủ nhóm'
  return owner.displayName || owner.username || 'Chủ nhóm'
}

function getOwnerAvatar(owner: Group['ownerId'] | undefined) {
  if (!owner || typeof owner === 'string') return null
  return owner.avatar || null
}

export default function MemberGroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [group, setGroup] = useState<Group | null>(null)
  const [ratingsData, setRatingsData] = useState<OwnerRatingsResponse | null>(null)
  const [loadingGroup, setLoadingGroup] = useState(true)
  const [loadingRatings, setLoadingRatings] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isVip, setIsVip] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)

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

  const fetchGroupDetails = useCallback(async () => {
    if (!id) return
    setLoadingGroup(true)
    setError(null)
    try {
      const response = await fetchClient(`/groups/${id}`, { method: 'GET', requireAuth: true })
      setGroup(response)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải thông tin chi tiết nhóm'
      setError(message)
      toast.error(message)
    } finally {
      setLoadingGroup(false)
    }
  }, [id])

  const fetchOwnerRatings = useCallback(async (ownerId: string) => {
    setLoadingRatings(true)
    try {
      const response = await fetchClient(`/ratings/owner/${ownerId}?itemPerPage=50`, {
        method: 'GET',
        requireAuth: true,
      })
      setRatingsData(response)
    } catch (err) {
      console.error('Lỗi khi tải đánh giá của chủ nhóm:', err)
    } finally {
      setLoadingRatings(false)
    }
  }, [])

  useEffect(() => {
    void fetchGroupDetails()
  }, [fetchGroupDetails])

  useEffect(() => {
    if (group) {
      const ownerId = typeof group.ownerId === 'string' ? group.ownerId : group.ownerId?._id || group.ownerId?.id
      if (ownerId) {
        void fetchOwnerRatings(ownerId)
      } else {
        setLoadingRatings(false)
      }
    }
  }, [group, fetchOwnerRatings])

  const handleJoinGroup = async () => {
    if (!id) return
    if (!user?.userID) {
      toast.error('Bạn cần đăng nhập để tham gia nhóm')
      return
    }

    setJoining(true)
    try {
      await fetchClient('/transactions/join-request', {
        method: 'POST',
        body: JSON.stringify({ groupId: id }),
        requireAuth: true,
      })
      toast.success('Yêu cầu tham gia nhóm đã được gửi thành công!')
      // Redirect to participant orders list after success so they can track the order
      setTimeout(() => {
        navigate('/dashboard/participant/orders')
      }, 1500)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể gia nhập nhóm')
    } finally {
      setJoining(false)
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    const rounded = Math.round(rating)
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`size-4 ${i <= rounded ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      )
    }
    return <div className='flex items-center gap-0.5'>{stars}</div>
  }

  const getInitials = (name: string) => {
    if (!name) return 'O'
    const parts = name.split(' ')
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  if (loadingUser || loadingGroup) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-2'>
          <div className='h-8 w-24 animate-pulse rounded bg-muted' />
        </div>
        <div className='grid gap-6 md:grid-cols-3'>
          <div className='md:col-span-2 space-y-6'>
            <Card className='animate-pulse'>
              <CardHeader className='space-y-3'>
                <div className='h-8 w-1/3 rounded bg-muted' />
                <div className='h-4 w-1/4 rounded bg-muted/70' />
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='h-4 w-full rounded bg-muted/60' />
                <div className='h-4 w-2/3 rounded bg-muted/60' />
                <div className='h-12 w-full rounded bg-muted/70' />
              </CardContent>
            </Card>
          </div>
          <div className='space-y-6'>
            <Card className='animate-pulse'>
              <CardContent className='p-6 space-y-4'>
                <div className='mx-auto size-20 rounded-full bg-muted' />
                <div className='h-5 w-1/2 mx-auto rounded bg-muted' />
                <div className='h-4 w-1/3 mx-auto rounded bg-muted/80' />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!isVip) {
    return (
      <div className='flex items-center justify-center py-10 px-4'>
        <Card className='max-w-md w-full rounded-lg shadow text-center p-8 relative overflow-hidden'>
          <div className='relative flex flex-col items-center gap-6'>
            <div className='flex size-16 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
              <Lock className='size-8' />
            </div>
            
            <div className='space-y-2'>
              <h3 className='text-2xl font-bold tracking-tight'>Yêu cầu tài khoản VIP</h3>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                Tính năng tham gia nhóm dùng chung phần mềm chỉ dành riêng cho thành viên VIP của EduShare. Kích hoạt VIP ngay để bắt đầu chia sẻ chi phí!
              </p>
            </div>

            <div className='w-full pt-4 space-y-3 relative z-10'>
              <Button 
                onClick={() => navigate('/dashboard/wallet')}
                variant='default'
                className='w-full rounded-md h-12 font-medium'
              >
                Nâng cấp VIP (29,000đ/tháng)
              </Button>
              <Button 
                onClick={() => navigate('/dashboard/overview')}
                variant='outline'
                className='w-full rounded-md h-12 font-medium'
              >
                Quay lại
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className='space-y-6'>
        <Button variant='ghost' onClick={() => navigate('/dashboard/participant')} className='gap-2'>
          <ArrowLeft className='size-4' /> Quay lại
        </Button>
        <Card className='border-destructive bg-destructive/10'>
          <CardContent className='flex flex-col items-center justify-center p-12 text-center'>
            <Info className='size-12 text-destructive' />
            <h3 className='mt-4 text-lg font-semibold text-destructive'>Không tìm thấy nhóm</h3>
            <p className='mt-2 text-sm text-muted-foreground'>
              {error || 'Nhóm này không tồn tại hoặc bạn không có quyền truy cập.'}
            </p>
            <Button className='mt-6' onClick={() => navigate('/dashboard/participant')}>
              Quay lại danh sách nhóm
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = Math.round((group.occupiedSlots / group.totalSlots) * 100)
  const slotsLeft = Math.max(group.totalSlots - group.occupiedSlots, 0)
  const ownerName = getOwnerName(group.ownerId)
  const ownerAvatar = getOwnerAvatar(group.ownerId)
  const isJoinable = group.status === 'available' && slotsLeft > 0

  const isOwner = typeof group.ownerId === 'string'
    ? group.ownerId === user?.userID
    : (group.ownerId?._id || group.ownerId?.id) === user?.userID

  const isMember = (group.members ?? []).some((m) => {
    if (typeof m === 'string') return m === user?.userID
    return m._id === user?.userID
  })

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Button
          variant='ghost'
          onClick={() => navigate('/dashboard/participant')}
          className='gap-2 text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='size-4' /> Quay lại danh sách
        </Button>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        {/* Left column: Group info & Join action */}
        <div className='md:col-span-2 space-y-6'>
          <Card className='overflow-hidden border shadow-sm'>
            <CardHeader className='border-b bg-muted/30 pb-6'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                <div className='space-y-1.5'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <Badge variant='outline' className='bg-primary/5 text-primary text-xs font-semibold px-2.5 py-0.5'>
                      {group.category}
                    </Badge>
                    <Badge variant={STATUS_VARIANTS[group.status] ?? 'outline'} className='rounded-full text-xs px-2.5'>
                      {STATUS_LABEL[group.status] ?? group.status}
                    </Badge>
                  </div>
                  <CardTitle className='text-2xl sm:text-3xl font-bold tracking-tight mt-1'>{group.name}</CardTitle>
                  <CardDescription className='text-sm flex items-center gap-1.5 mt-1'>
                    <Calendar className='size-3.5' /> Ngày tạo: {formatDate(group.createdAt)}
                  </CardDescription>
                </div>
                <div className='flex flex-col items-start sm:items-end gap-1'>
                  <span className='text-xs text-muted-foreground'>Giá mỗi slot</span>
                  <span className='text-2xl font-bold text-primary'>{formatCurrency(group.price)}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className='p-6 space-y-6'>
              {/* Slots details */}
              <div className='space-y-3'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground font-medium'>Độ lấp đầy thành viên</span>
                  <span className='font-semibold'>{group.occupiedSlots}/{group.totalSlots} slot ({progress}%)</span>
                </div>
                <Progress value={progress} className='h-3 rounded-full' />
              </div>

              <Separator />

              {/* Group specs */}
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <div className='rounded-lg border p-4 bg-muted/10'>
                  <div className='flex items-center gap-2 text-muted-foreground text-xs font-medium'>
                    <Users className='size-4 text-primary' />
                    <span>Slot còn trống</span>
                  </div>
                  <p className='text-lg font-bold mt-1.5'>{slotsLeft} slot</p>
                </div>

                <div className='rounded-lg border p-4 bg-muted/10'>
                  <div className='flex items-center gap-2 text-muted-foreground text-xs font-medium'>
                    <DollarSign className='size-4 text-primary' />
                    <span>Tổng tiền nhóm</span>
                  </div>
                  <p className='text-lg font-bold mt-1.5'>{formatCurrency(group.totalPrice)}</p>
                </div>

                <div className='rounded-lg border p-4 bg-muted/10'>
                  <div className='flex items-center gap-2 text-muted-foreground text-xs font-medium'>
                    <Calendar className='size-4 text-primary' />
                    <span>Hạn dùng dự kiến</span>
                  </div>
                  <p className='text-lg font-bold mt-1.5 truncate'>{formatDate(group.expiredAt)}</p>
                </div>
              </div>

              {/* Description */}
              <div className='space-y-2.5'>
                <h3 className='font-semibold text-base flex items-center gap-2'>
                  <Info className='size-4 text-primary' /> Mô tả nhóm chia sẻ
                </h3>
                <p className='text-sm text-muted-foreground leading-relaxed whitespace-pre-line bg-muted/20 p-4 rounded-lg border border-dashed'>
                  {group.description || 'Chủ nhóm không cung cấp mô tả chi tiết cho nhóm này.'}
                </p>
              </div>

              {/* Safety notice (Escrow system info) */}
              <div className='rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-3.5 items-start'>
                <ShieldCheck className='size-5 text-primary shrink-0 mt-0.5' />
                <div className='space-y-1 text-xs'>
                  <p className='font-semibold text-primary'>Giao dịch ký quỹ an toàn</p>
                  <p className='text-muted-foreground leading-relaxed'>
                    Khi bạn nhấn tham gia nhóm, số tiền tương ứng sẽ được hệ thống tạm giữ trong ví ký quỹ. 
                    Chủ nhóm sẽ KHÔNG nhận được tiền ngay lập tức. Tiền chỉ giải ngân sau khi chủ nhóm cung cấp 
                    thông tin đăng nhập/bằng chứng và bạn xác nhận vào nhóm thành công (hoặc tự động sau 48 giờ).
                  </p>
                </div>
              </div>

              {/* Join action button */}
              <div className='pt-2'>
                {isOwner ? (
                  <Button className='w-full' disabled size='lg'>
                    Bạn là chủ nhóm này
                  </Button>
                ) : isMember ? (
                  <Button className='w-full bg-secondary text-secondary-foreground hover:bg-secondary' disabled size='lg'>
                    <CheckCircle2 className='mr-2 size-4 text-green-500' /> Bạn đã tham gia nhóm này
                  </Button>
                ) : (
                  <Button
                    className='w-full rounded-md font-semibold py-6 text-base'
                    disabled={!isJoinable || joining}
                    onClick={handleJoinGroup}
                    size='lg'
                  >
                    {joining ? (
                      <>
                        <Loader2 className='mr-2 size-5 animate-spin' />
                        Đang xử lý yêu cầu...
                      </>
                    ) : (
                      <>Gia nhập nhóm ngay ({formatCurrency(group.price)})</>
                    )}
                  </Button>
                )}
                {!isJoinable && !isOwner && !isMember && (
                  <p className='text-center text-xs text-destructive mt-2'>
                    Nhóm hiện tại không khả dụng hoặc đã đủ thành viên.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Owner Profile & Ratings */}
        <div className='space-y-6'>
          {/* Owner info */}
          <Card className='border shadow-sm'>
            <CardHeader className='pb-4 border-b'>
              <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                <UserRound className='size-4 text-primary' /> Thông tin chủ nhóm
              </CardTitle>
            </CardHeader>
            <CardContent className='p-6 space-y-4 text-center'>
              <Avatar className='mx-auto size-20 border-2 border-primary/20 shadow-sm'>
                {ownerAvatar && <AvatarImage src={ownerAvatar} alt={ownerName} />}
                <AvatarFallback className='text-lg bg-primary/10 text-primary font-bold'>
                  {getInitials(ownerName)}
                </AvatarFallback>
              </Avatar>

              <div className='space-y-1'>
                <h4 className='font-bold text-lg text-foreground'>{ownerName}</h4>
                <div className='flex items-center justify-center gap-1.5 text-sm'>
                  {ratingsData ? (
                    <>
                      {renderStars(ratingsData.averageRating)}
                      <span className='font-medium text-amber-500'>{ratingsData.averageRating.toFixed(1)}/5</span>
                      <span className='text-muted-foreground'>({ratingsData.totalRatings} đánh giá)</span>
                    </>
                  ) : typeof group.ownerId !== 'string' && group.ownerId?.trustScore !== undefined ? (
                    <>
                      {renderStars(group.ownerId.trustScore)}
                      <span className='font-medium text-amber-500'>{(group.ownerId.trustScore).toFixed(1)}/5</span>
                    </>
                  ) : (
                    <span className='text-muted-foreground text-xs'>Chưa có thông tin đánh giá</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ratings list */}
          <Card className='border shadow-sm'>
            <CardHeader className='pb-3 border-b'>
              <CardTitle className='text-base font-semibold'>Đánh giá từ các thành viên khác</CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              {loadingRatings ? (
                <div className='p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground text-sm'>
                  <Loader2 className='size-5 animate-spin text-primary' />
                  <span>Đang tải đánh giá chủ nhóm...</span>
                </div>
              ) : !ratingsData || ratingsData.list.length === 0 ? (
                <div className='p-8 text-center text-sm text-muted-foreground'>
                  Chưa có đánh giá nào cho chủ nhóm này.
                </div>
              ) : (
                <div className='divide-y max-h-[400px] overflow-y-auto'>
                  {ratingsData.list.map((rating) => {
                    const rName =
                      typeof rating.senderId === 'string'
                        ? 'Thành viên'
                        : rating.senderId?.displayName || 'Thành viên'
                    const rAvatar =
                      typeof rating.senderId === 'string' ? null : rating.senderId?.avatar || null
                    return (
                      <div key={rating._id} className='p-4 space-y-2 hover:bg-muted/10 transition'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <Avatar className='size-8 border'>
                              {rAvatar && <AvatarImage src={rAvatar} alt={rName} />}
                              <AvatarFallback className='text-xs bg-muted text-muted-foreground'>
                                {getInitials(rName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className='text-xs font-semibold text-foreground'>{rName}</p>
                              <p className='text-[10px] text-muted-foreground'>{formatDate(rating.createdAt)}</p>
                            </div>
                          </div>
                          {renderStars(rating.rating)}
                        </div>
                        {rating.comment && (
                          <p className='text-xs text-muted-foreground leading-relaxed pl-10 break-words'>
                            "{rating.comment}"
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
