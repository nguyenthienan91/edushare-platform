import { ArrowUpRight, ShieldAlert, Users, Wallet, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const stats = [
  {
    label: 'Tổng số người dùng',
    value: '1,284',
    note: '+18% trong 30 ngày',
    icon: Users,
    tone: 'bg-sky-100 text-sky-600'
  },
  {
    label: 'Nhóm đang hoạt động',
    value: '86',
    note: '32 nhóm vừa được tạo',
    icon: Zap,
    tone: 'bg-emerald-100 text-emerald-600'
  },
  {
    label: 'Doanh thu hệ thống',
    value: '$42,900',
    note: 'Tăng trưởng ổn định',
    icon: Wallet,
    tone: 'bg-violet-100 text-violet-600'
  },
  {
    label: 'Khiếu nại đang chờ',
    value: '14',
    note: 'Cần xử lý trong hôm nay',
    icon: ShieldAlert,
    tone: 'bg-amber-100 text-amber-700'
  }
]

const communityGrowth = [24, 30, 28, 36, 42, 48, 56]
const chartHeight = 240
const chartWidth = 540
const padding = 28
const maxValue = Math.max(...communityGrowth)
const minValue = Math.min(...communityGrowth)
const range = Math.max(maxValue - minValue, 1)

const points = communityGrowth
  .map((value, index) => {
    const x = padding + (index * (chartWidth - padding * 2)) / (communityGrowth.length - 1)
    const y = chartHeight - padding - ((value - minValue) / range) * (chartHeight - padding * 2)
    return `${x},${y}`
  })
  .join(' ')

const areaPath = `M ${padding},${chartHeight - padding} L ${points} L ${chartWidth - padding},${chartHeight - padding} Z`
const linePath = `M ${points.replaceAll(' ', ' L ')}`

const topServices = [
  { name: 'Netflix', tone: 'bg-rose-100 text-rose-700' },
  { name: 'Spotify', tone: 'bg-emerald-100 text-emerald-700' },
  { name: 'Youtube Premium', tone: 'bg-sky-100 text-sky-700' },
  { name: 'Disney+', tone: 'bg-violet-100 text-violet-700' }
]

export default function AdminDashboard() {
  return (
    <div className='space-y-6 bg-[#f0f9ff]'>
      <div className='rounded-3xl border border-sky-100/80 bg-white p-6 shadow-sm shadow-sky-100/50'>
        <p className='text-sm font-medium text-emerald-600'>ShareBuddy Admin Dashboard</p>
        <h2 className='mt-2 text-3xl font-semibold tracking-tight text-slate-900'>
          Cộng đồng đang phát triển thế nào?
        </h2>
        <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-500'>
          Theo dõi nhịp tăng trưởng của cộng đồng bằng một giao diện trực quan, thoáng đãng và dễ đọc.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className='rounded-3xl border-slate-200/70 bg-white shadow-sm shadow-sky-100/30'>
              <CardContent className='p-5'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='space-y-3'>
                    <div className={`flex size-11 items-center justify-center rounded-2xl ${item.tone}`}>
                      <Icon className='size-5' />
                    </div>
                    <div>
                      <p className='text-sm text-slate-500'>{item.label}</p>
                      <p className='mt-1 text-3xl font-semibold tracking-tight text-slate-900'>{item.value}</p>
                      <p className='mt-1 text-xs text-slate-500'>{item.note}</p>
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
        <Card className='rounded-3xl border-slate-200/70 bg-white shadow-sm shadow-sky-100/30'>
          <CardHeader>
            <CardTitle className='text-slate-900'>Community Health Chart</CardTitle>
            <CardDescription>
              Lượng người dùng mới trong tuần, hiển thị bằng biểu đồ vùng màu xanh lá nhạt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='rounded-3xl bg-emerald-50/60 p-4'>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className='h-65 w-full overflow-visible'>
                <defs>
                  <linearGradient id='growthArea' x1='0' x2='0' y1='0' y2='1'>
                    <stop offset='0%' stopColor='#34d399' stopOpacity='0.28' />
                    <stop offset='100%' stopColor='#34d399' stopOpacity='0.02' />
                  </linearGradient>
                </defs>

                <path d={areaPath} fill='url(#growthArea)' />
                <path
                  d={linePath}
                  fill='none'
                  stroke='#22c55e'
                  strokeWidth='4'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />

                {communityGrowth.map((value, index) => {
                  const x = padding + (index * (chartWidth - padding * 2)) / (communityGrowth.length - 1)
                  const y = chartHeight - padding - ((value - minValue) / range) * (chartHeight - padding * 2)
                  return (
                    <g key={`${value}-${index}`}>
                      <circle cx={x} cy={y} r='5' fill='#16a34a' stroke='#ffffff' strokeWidth='4' />
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

        <Card className='rounded-3xl border-slate-200/70 bg-white shadow-sm shadow-sky-100/30'>
          <CardHeader>
            <CardTitle className='text-slate-900'>Top Services</CardTitle>
            <CardDescription>Các dịch vụ được yêu thích nhất trong cộng đồng.</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-3'>
            {topServices.map((service) => (
              <Badge key={service.name} className={`rounded-full px-4 py-2 text-sm font-medium ${service.tone}`}>
                {service.name}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
