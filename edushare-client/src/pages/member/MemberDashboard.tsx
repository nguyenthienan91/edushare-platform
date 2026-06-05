import { useState, useEffect } from 'react'
import { ArrowUpRight, CirclePlus, Landmark, Users, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchClient } from '@/utils/fetchClient'

const featuredGroups = [
  { name: 'Netflix Premium', members: '4/5 thành viên', interactions: '128 tương tác', trend: '+18%' },
  { name: 'YouTube Family', members: '5/5 thành viên', interactions: '94 tương tác', trend: '+12%' },
  { name: 'Spotify Duo', members: '2/2 thành viên', interactions: '61 tương tác', trend: '+8%' },
]

const weeklyMembers = [64, 72, 69, 81, 88, 96, 104]
const chartHeight = 220
const chartWidth = 520
const padding = 24
const maxValue = Math.max(...weeklyMembers)
const minValue = Math.min(...weeklyMembers)
const range = Math.max(maxValue - minValue, 1)

const points = weeklyMembers
  .map((value, index) => {
    const x = padding + (index * (chartWidth - padding * 2)) / (weeklyMembers.length - 1)
    const y = chartHeight - padding - ((value - minValue) / range) * (chartHeight - padding * 2)
    return `${x},${y}`
  })
  .join(' ')

const areaPath = `M ${padding},${chartHeight - padding} L ${points} L ${chartWidth - padding},${chartHeight - padding} Z`
const linePath = `M ${points.replaceAll(' ', ' L ')}`

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
}

export default function MemberDashboard() {
  const [balance, setBalance] = useState<number | null>(null)
  const [groupCount, setGroupCount] = useState<number | null>(null)
  const [memberCount, setMemberCount] = useState<number | null>(null)
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    let active = true

    const loadData = async () => {
      try {
        const userRes = await fetchClient('/users/me')
        if (!active) return
        if (userRes) {
          setBalance(userRes.balance ?? 0)
          setUserName(userRes.displayName || userRes.username || 'f')
          
          // Fetch groups and count them
          const groupsRes = await fetchClient(`/groups/search?ownerId=${userRes._id || userRes.id}`)
          if (!active) return
          if (groupsRes && Array.isArray(groupsRes.data)) {
            setGroupCount(groupsRes.data.length)
          }

          // Fetch dashboard stats (total members)
          const statsRes = await fetchClient('/users/me/dashboard-stats')
          if (!active) return
          if (statsRes && typeof statsRes.totalMembers === 'number') {
            setMemberCount(statsRes.totalMembers)
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [])

  const stats = [
    {
      label: 'Số dư',
      value: balance !== null ? formatCurrency(balance) : '...',
      note: '+12% so với tuần trước',
      icon: Wallet,
      tone: 'bg-sky-100 text-sky-600',
    },
    {
      label: 'Nhóm đang chạy',
      value: groupCount !== null ? String(groupCount).padStart(2, '0') : '...',
      note: 'Các nhóm do bạn làm chủ',
      icon: Landmark,
      tone: 'bg-emerald-100 text-emerald-600',
    },
    {
      label: 'Thành viên',
      value: memberCount !== null ? String(memberCount).padStart(2, '0') : '...',
      note: 'Tổng số thành viên trong nhóm',
      icon: Users,
      tone: 'bg-violet-100 text-violet-600',
    },
  ]

  return (
    <div className='space-y-6 '>
      <Card >
        <CardContent className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div className='space-y-2'>
            <Badge className='rounded-full bg-sky-100 text-sky-700 hover:bg-sky-100'>Owner Dashboard</Badge>
            <h2 className='text-2xl font-semibold tracking-tight  md:text-3xl'>
              Chào buổi sáng, {userName || 'f'}! Cộng đồng của bạn đang hoạt động rất tốt
            </h2>
            <p className='max-w-2xl text-sm leading-6 '>
              Giao diện tối giản, nhẹ nhàng và đủ thông tin để bạn theo dõi hoạt động hằng ngày mà không bị rối.
            </p>
          </div>
          <Button className='rounded-full bg-slate-950 px-5 text-white hover:bg-slate-800'>
            <CirclePlus className='mr-2 size-4' />
            Tạo nhóm mới
          </Button>
        </CardContent>
      </Card>

      <div className='grid gap-4 md:grid-cols-3'>
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} >
              <CardContent className='p-5'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='space-y-3'>
                    <div className={`flex size-11 items-center justify-center rounded-2xl ${item.tone}`}>
                      <Icon className='size-5' />
                    </div>
                    <div>
                      <p className='text-sm '>{item.label}</p>
                      <p className='mt-1 text-3xl font-semibold tracking-tight '>{item.value}</p>
                      <p className='mt-1 text-xs '>{item.note}</p>
                    </div>
                  </div>
                  <ArrowUpRight className='size-4 text-slate-300' />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className='grid gap-4 lg:grid-cols-[1.2fr_0.8fr]'>
        <Card>
          <CardHeader>
            <CardTitle className=''>Tăng trưởng thành viên trong tuần</CardTitle>
            <CardDescription>Biểu đồ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='rounded-3xl /70 p-4'>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className='h-[260px] w-full overflow-visible'>
                <defs>
                  <linearGradient id='memberArea' x1='0' x2='0' y1='0' y2='1'>
                    <stop offset='0%' stopColor='#38bdf8' stopOpacity='0.35' />
                    <stop offset='100%' stopColor='#38bdf8' stopOpacity='0.02' />
                  </linearGradient>
                </defs>

                <path d={areaPath} fill='url(#memberArea)' />
                <path
                  d={linePath}
                  fill='none'
                  stroke='#38bdf8'
                  strokeWidth='4'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />

                {weeklyMembers.map((value, index) => {
                  const x = padding + (index * (chartWidth - padding * 2)) / (weeklyMembers.length - 1)
                  const y = chartHeight - padding - ((value - minValue) / range) * (chartHeight - padding * 2)
                  return (
                    <g key={`${value}-${index}`}>
                      <circle cx={x} cy={y} r='5' fill='#0ea5e9' stroke='#ffffff' strokeWidth='4' />
                      <text
                        x={x}
                        y={chartHeight - 4}
                        textAnchor='middle'
                        className='fill-slate-400 text-[12px] font-medium'
                      >
                        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index]}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className=''>Nhóm nổi bật</CardTitle>
            <CardDescription>Các nhóm có nhiều tương tác nhất trong tuần.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {featuredGroups.map((group) => (
              <div
                key={group.name}
                className='rounded-3xl border border-slate-200/70  p-4 transition-colors hover:/60'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='font-medium '>{group.name}</p>
                    <p className='mt-1 text-sm '>{group.members}</p>
                  </div>
                  <Badge className='rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100'>
                    {group.trend}
                  </Badge>
                </div>
                <div className='mt-4 flex items-center justify-between text-sm '>
                  <span>{group.interactions}</span>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='rounded-full px-3 text-sky-700 hover:bg-sky-100 hover:text-sky-800'
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
