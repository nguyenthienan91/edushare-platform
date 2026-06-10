import { ArrowUpRight, CalendarDays, ShieldAlert, Users, Wallet, Zap } from 'lucide-react'
import { addDays } from 'date-fns'
import * as React from 'react'
import type { DateRange } from 'react-day-picker'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMemo } from 'react'

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

const chartData = [
  { name: 'T2', value: 24 },
  { name: 'T3', value: 30 },
  { name: 'T4', value: 28 },
  { name: 'T5', value: 36 },
  { name: 'T6', value: 42 },
  { name: 'T7', value: 48 },
  { name: 'CN', value: 56 },
]

const topServices = [
  { name: 'Netflix', tone: 'bg-rose-100 text-rose-700' },
  { name: 'Spotify', tone: 'bg-emerald-100 text-emerald-700' },
  { name: 'Youtube Premium', tone: 'bg-sky-100 text-sky-700' },
  { name: 'Disney+', tone: 'bg-violet-100 text-violet-700' }
]


const dateTabs = [
  { value: 'day', label: 'Theo ngày', icon: CalendarDays },
  { value: 'month', label: 'Theo tháng', icon: CalendarDays },
  { value: 'year', label: 'Theo năm', icon: CalendarDays },
] as const

export default function AdminDashboard() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 12),
    to: addDays(new Date(new Date().getFullYear(), 0, 12), 30),
  })
  const [dateFilterMode, setDateFilterMode] = React.useState<'day' | 'month' | 'year'>('day')

  const rangeLabel = useMemo(() => {
    switch (dateFilterMode) {
      case 'day':
        return 'Chọn ngày'
      case 'month':
        return 'Chọn tháng'
      case 'year':
        return 'Chọn năm'
      default:
        return 'Chọn ngày'
    }
  }, [dateFilterMode])

  return (
    <div className='space-y-6 '>
      <Card>
        <CardContent>
          <Badge className='rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-100'>Admin Dashboard</Badge>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight '>
            Cộng đồng đang phát triển thế nào?
          </h2>
          <p className='mt-2 max-w-2xl text-sm leading-6 '>
            Theo dõi nhịp tăng trưởng của cộng đồng bằng một giao diện trực quan, thoáng đãng và dễ đọc.
          </p>
        </CardContent>
      </Card>

      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'>
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className='rounded-xl border-slate-200/70  shadow-sm shadow-sky-100/30'>
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

      <Card>
        <CardHeader className='space-y-4 border-b border-slate-100/80 pb-4'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <CardTitle className=''>Community Health Chart</CardTitle>
           
            </div>

            <div className='flex flex-col gap-3 md:flex-row md:items-center'>
              <Tabs value={dateFilterMode} onValueChange={(value) => setDateFilterMode(value as typeof dateFilterMode)}>
                <TabsList className='rounded-full bg-slate-100 p-1'>
                  {dateTabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className='rounded-full px-4 py-2 text-sm data-[state=active]: data-[state=active]:'
                      >
                        <Icon className='mr-2 size-4' />
                        {tab.label}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </Tabs>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className='h-12 min-w-[280px] justify-start rounded-2xl border-slate-200  px-4 text-left font-normal  hover:bg-slate-100'
                  >
                    <span className='truncate'>{rangeLabel}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align='end' className='w-auto p-0'>
                  <Calendar
                    mode='range'
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    className='rounded-2xl border border-slate-200  p-3 shadow-xl shadow-slate-200/60'
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='h-[320px] rounded-xl bg-emerald-50/60 p-4'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id='growthArea' x1='0' x2='0' y1='0' y2='1'>
                  <stop offset='0%' stopColor='#34d399' stopOpacity='0.35' />
                  <stop offset='100%' stopColor='#34d399' stopOpacity='0.03' />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#dbeafe' />
              <XAxis dataKey='name' tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={32} />
              <Tooltip
                contentStyle={{
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 20px 25px -5px rgb(15 23 42 / 0.1)',
                }}
                labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                formatter={(value: any) => [`${value} users`, 'Tăng trưởng']}
              />
              <Area
                type='monotone'
                dataKey='value'
                stroke='#22c55e'
                strokeWidth={3}
                fill='url(#growthArea)'
                dot={{ r: 4, strokeWidth: 2, fill: '#16a34a' }}
                activeDot={{ r: 6 }}
              />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className=''>Top Services</CardTitle>
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
  )
}
