import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowRight, Sparkles, Users, Loader2, CalendarIcon, Lock } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { fetchClient } from '@/utils/fetchClient'
import { GroupCategory } from '@/types/group-category'
import type { GroupCategoryType } from '@/types/group-category'

export default function MemberCreateGroup() {
  const navigate = useNavigate()
  const [loadingUser, setLoadingUser] = useState(true)
  const [isVip, setIsVip] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [groupName, setGroupName] = useState('')
  const [category, setCategory] = useState<GroupCategoryType>(GroupCategory.PRODUCTIVITY)
  const [maxMembers, setMaxMembers] = useState<number>(5)
  const [pricePerSlot, setPricePerSlot] = useState<number>(0)
  const [description, setDescription] = useState('')
  const [expiredAt, setExpiredAt] = useState<Date | undefined>(undefined)

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

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

  const totalPrice = useMemo(() => maxMembers * pricePerSlot, [maxMembers, pricePerSlot])

  const handleSubmit = async () => {
    // Client-side validations
    if (!groupName.trim()) {
      return toast.error('Vui lòng nhập tên nhóm')
    }
    if (!category) {
      return toast.error('Vui lòng chọn danh mục phần mềm')
    }
    if (!maxMembers || maxMembers < 2) {
      return toast.error('Số lượng thành viên tối thiểu là 2')
    }
    if (!pricePerSlot || pricePerSlot <= 0) {
      return toast.error('Vui lòng nhập giá tiền mỗi slot')
    }
    if (!description.trim()) {
      return toast.error('Vui lòng nhập mô tả chi tiết nhóm')
    }

    setSubmitting(true)

    try {
      const body = {
        name: groupName.trim(),
        category: category,
        totalSlots: Number(maxMembers),
        totalPrice: Number(totalPrice),
        description: description.trim(),
        expiredAt: expiredAt ? expiredAt.toISOString() : null,
      }

      await fetchClient('/groups', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      toast.success('Tạo nhóm dùng chung thành công!')
      
      // Clear form
      setGroupName('')
      setDescription('')
      setPricePerSlot(0)
      setExpiredAt(undefined)
      
      // Redirect to Quản lý nhóm (Của tôi)
      navigate('/dashboard/groups')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Lỗi khi tạo nhóm mới. Vui lòng kiểm tra lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingUser) {
    return (
      <div className='flex h-[400px] items-center justify-center'>
        <Loader2 className='size-8 animate-spin text-indigo-600' />
      </div>
    )
  }

  if (!isVip) {
    return (
      <div className='flex items-center justify-center py-10 px-4'>
        <Card className='max-w-md w-full rounded-3xl border-slate-200/80 shadow-lg text-center p-8  relative overflow-hidden'>
          <div className='absolute -right-16 -top-16 size-36 rounded-full bg-indigo-50/50' />
          <div className='absolute -left-16 -bottom-16 size-36 rounded-full bg-indigo-50/30' />
          
          <div className='relative flex flex-col items-center gap-6'>
            <div className='flex size-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm'>
              <Lock className='size-8' />
            </div>
            
            <div className='space-y-2'>
              <h3 className='text-2xl font-bold tracking-tight'>Yêu cầu tài khoản VIP</h3>
              <p className='text-sm text-slate-500 leading-relaxed'>
                Tính năng tạo nhóm dùng chung phần mềm chỉ dành riêng cho thành viên VIP của EduShare. Kích hoạt VIP ngay để bắt đầu chia sẻ chi phí!
              </p>
            </div>

            <div className='w-full pt-4 space-y-3 relative z-10'>
              <Button 
                onClick={() => navigate('/dashboard/wallet')}
                className='w-full rounded-full bg-indigo-600 h-12 text-white hover:bg-indigo-700 font-medium'
              >
                Nâng cấp VIP (29,000đ/tháng)
              </Button>
              <Button 
                onClick={() => navigate('/dashboard/overview')}
                variant='outline'
                className='w-full rounded-full h-12 border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
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
    <div className='space-y-6 '>
      <Card>
        <CardContent>
          <Badge className='rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-100'>Create Group</Badge>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight '>Tạo nhóm mới</h2>
          <p className='mt-2 max-w-2xl text-sm leading-6 '>
            Xây dựng một cộng đồng nhỏ với cảm giác thân thiện, tin tưởng và rõ ràng ngay từ đầu.
          </p>
        </CardContent>
      </Card>

      <div className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr]'>
        <Card>
          <CardHeader>
            <CardTitle className=''>Thông tin nhóm</CardTitle>
            <CardDescription>Điền thông tin cơ bản để bắt đầu nhóm chia sẻ của bạn.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-5'>
            <div className='grid gap-2'>
              <Label className=''>Tên nhóm</Label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className='h-12 rounded-2xl border-slate-200  px-4'
                placeholder='VD: Netflix Premium'
                disabled={submitting}
              />
            </div>

            <div className='grid gap-2'>
              <Label className=''>Danh mục phần mềm</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as GroupCategoryType)} disabled={submitting}>
                <SelectTrigger className='h-12 rounded-2xl border-slate-200  px-4'>
                  <SelectValue placeholder='Chọn danh mục phần mềm' />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(GroupCategory).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='grid gap-2'>
              <Label className=''>Số lượng thành viên (Slot)</Label>
              <div className='rounded-2xl border border-slate-200  p-4'>
                <div className='mb-3 flex items-center justify-between text-sm '>
                  <span>Slot hiện tại</span>
                  <span className='font-medium '>{maxMembers} người</span>
                </div>
                <Slider 
                  value={[maxMembers]} 
                  onValueChange={(val) => setMaxMembers(val[0])} 
                  min={2} 
                  max={20} 
                  step={1} 
                  className='py-2' 
                  disabled={submitting}
                />
              </div>
            </div>

            <div className='grid gap-2'>
              <Label className=''>Ngày hết hạn nhóm (Không bắt buộc)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'h-12 w-full justify-start rounded-2xl border-slate-200 px-4 text-left font-normal hover:bg-slate-50 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none',
                      !expiredAt && 'text-slate-400'
                    )}
                    disabled={submitting}
                  >
                    <CalendarIcon className='mr-2 size-4 text-slate-400' />
                    {expiredAt ? format(expiredAt, 'dd/MM/yyyy') : 'Chọn ngày hết hạn nhóm'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className='w-auto p-0 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-slate-50 transition-none shadow-xl' 
                  align='start'
                >
                  <Calendar
                    mode='single'
                    selected={expiredAt}
                    onSelect={setExpiredAt}
                    disabled={(date) => date < today || submitting}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className='grid gap-2 sm:grid-cols-2'>
              <div className='grid gap-2'>
                <Label className=''>Giá tiền mỗi slot (VND)</Label>
                <Input
                  type='number'
                  value={pricePerSlot || ''}
                  onChange={(e) => setPricePerSlot(Number(e.target.value || 0))}
                  className='h-12 rounded-2xl border-slate-200  px-4'
                  placeholder='35000'
                  disabled={submitting}
                />
              </div>
              <div className='grid gap-2'>
                <Label className=''>Tổng giá nhóm</Label>
                <Input
                  value={`${totalPrice.toLocaleString('vi-VN')} VND`}
                  readOnly
                  className='h-12 rounded-2xl border-slate-200  px-4 bg-slate-50'
                />
              </div>
            </div>

            <div className='grid gap-2'>
              <Label className=''>Lời chào mừng thành viên (Mô tả nhóm)</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className='min-h-[120px] rounded-2xl border border-slate-200  px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400'
                placeholder='Viết lời chào mừng cho các thành viên mới...'
                disabled={submitting}
              />
            </div>

            <div className='flex flex-wrap gap-3 pt-2'>
              <Button
                variant='outline'
                className='rounded-full border-indigo-200  text-indigo-700 hover:bg-indigo-50'
                onClick={() => navigate('/dashboard/groups')}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button 
                className='rounded-full bg-indigo-600 text-white hover:bg-indigo-700'
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className='mr-2 size-4 animate-spin' />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    Tạo nhóm ngay <ArrowRight className='ml-2 size-4' />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className=''>Live Preview Card</CardTitle>
            <CardDescription>Xem trước giao diện nhóm của bạn ngay khi chỉnh form.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='rounded-3xl  from-sky-50 to-white p-5 ring-1 ring-sky-100'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <div className='inline-flex items-center gap-2 rounded-full  px-3 py-1 text-xs font-medium text-sky-700 shadow-sm'>
                    <Sparkles className='size-3.5' />
                    Live Preview
                  </div>
                  <h3 className='mt-4 text-2xl font-semibold '>{groupName || 'Tên nhóm của bạn'}</h3>
                  <p className='mt-1 text-sm '>
                    {category} community
                  </p>
                </div>
                <div className='flex size-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600'>
                  <Users className='size-5' />
                </div>
              </div>

              <div className='mt-5 grid gap-3'>
                <div className='rounded-2xl  p-4 shadow-sm'>
                  <div className='flex items-center justify-between text-sm '>
                    <span>Slot</span>
                    <span>{maxMembers} người</span>
                  </div>
                  <p className='mt-1 text-lg font-semibold '>
                    {pricePerSlot.toLocaleString('vi-VN')} VND / người
                  </p>
                </div>

                <div className='rounded-2xl  p-4 shadow-sm'>
                  <p className='text-sm font-medium '>Lời chào</p>
                  <p className='mt-2 text-sm leading-6 '>{description || 'Chưa có lời chào mừng.'}</p>
                </div>

                <div className='rounded-2xl  p-4 shadow-sm'>
                  <p className='text-sm font-medium '>Tổng giá</p>
                  <p className='mt-2 text-2xl font-semibold '>{totalPrice.toLocaleString('vi-VN')} VND</p>
                </div>

                {expiredAt && (
                  <div className='rounded-2xl  p-4 shadow-sm'>
                    <p className='text-sm font-medium '>Ngày hết hạn</p>
                    <p className='mt-2 text-2xl font-semibold '>{format(expiredAt, 'dd/MM/yyyy')}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

