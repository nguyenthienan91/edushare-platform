import { ArrowUpRight, CalendarDays, Loader2, ShieldAlert, Users, Wallet, Zap } from 'lucide-react'
import { format } from 'date-fns'
import * as React from 'react'
import { useState, useEffect, useMemo, useCallback } from 'react'
import type { DateRange } from 'react-day-picker'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  DashboardService,
  type AdminDashboardStats,
  type CommunityHealthChartPoint,
} from '@/services/dashboard.service'

// ─── Chart config ─────────────────────────────────────────────────────────────

const communityChartConfig = {
  value: {
    label: 'Người dùng mới',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k`
  return amount.toLocaleString('vi-VN')
}

function buildStats(data: AdminDashboardStats) {
  const totalRevenue = data.totalVipRevenue + data.totalTopupAmount
  return [
    {
      label: 'Tổng số người dùng',
      value: data.totalUsers.toLocaleString('vi-VN'),
      note: `${data.totalActiveGroups} nhóm đang hoạt động`,
      icon: Users,
      tone: 'bg-sky-100 text-sky-600',
    },
    {
      label: 'Nhóm đang hoạt động',
      value: data.totalActiveGroups.toLocaleString('vi-VN'),
      note: `Tổng ${data.totalTransactions.toLocaleString('vi-VN')} giao dịch`,
      icon: Zap,
      tone: 'bg-emerald-100 text-emerald-600',
    },
    {
      label: 'Doanh thu hệ thống',
      value: formatCurrency(totalRevenue) + ' đ',
      note: `Topup: ${formatCurrency(data.totalTopupAmount)}đ · VIP: ${formatCurrency(data.totalVipRevenue)}đ`,
      icon: Wallet,
      tone: 'bg-violet-100 text-violet-600',
    },
    {
      label: 'Tổng rút đã duyệt',
      value: formatCurrency(data.totalApprovedWithdrawalAmount) + ' đ',
      note: `Tổng ${data.totalTransactions.toLocaleString('vi-VN')} giao dịch`,
      icon: ShieldAlert,
      tone: 'bg-amber-100 text-amber-700',
    },
  ]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const topServices = [
  { name: 'Microsoft Family', tone: 'bg-rose-100 text-rose-700' },
  { name: 'Spotify', tone: 'bg-emerald-100 text-emerald-700' },
  { name: 'Youtube Premium', tone: 'bg-sky-100 text-sky-700' },
  { name: 'Drive Family', tone: 'bg-violet-100 text-violet-700' },
]

const dateTabs = [
  { value: 'day', label: 'Theo ngày' },
  { value: 'week', label: 'Theo tuần' },
  { value: 'month', label: 'Theo tháng' },
  { value: 'year', label: 'Theo năm' },
] as const

type Period = 'day' | 'week' | 'month' | 'year'

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  // Stats
  const [statsData, setStatsData] = useState<AdminDashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Chart – period & date range
  const [period, setPeriod] = useState<Period>('week')
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)

  // Chart – data
  const [chartData, setChartData] = useState<CommunityHealthChartPoint[]>([])
  const [chartLoading, setChartLoading] = useState(true)
  const [chartError, setChartError] = useState<string | null>(null)

  // ── Fetch stats (once) ───────────────────────────────────────────────────
  useEffect(() => {
    DashboardService.getAdminStats()
      .then((res) => setStatsData(res.data))
      .catch(console.error)
      .finally(() => setStatsLoading(false))
  }, [])

  // ── Fetch chart (on period / dateRange change) ───────────────────────────
  const fetchChart = useCallback(() => {
    setChartLoading(true)
    setChartError(null)
    DashboardService.getCommunityHealthChart(period, dateRange?.from, dateRange?.to)
      .then((res) => setChartData(res.data))
      .catch(() => setChartError('Không thể tải dữ liệu biểu đồ.'))
      .finally(() => setChartLoading(false))
  }, [period, dateRange])

  useEffect(() => {
    fetchChart()
  }, [fetchChart])

  // ── Derived ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => (statsData ? buildStats(statsData) : []), [statsData])

  const rangeLabel = useMemo(() => {
    if (dateRange?.from && dateRange?.to)
      return `${format(dateRange.from, 'dd/MM/yyyy')} – ${format(dateRange.to, 'dd/MM/yyyy')}`
    if (dateRange?.from) return `Từ ${format(dateRange.from, 'dd/MM/yyyy')}`
    return 'Tùy chỉnh khoảng thời gian'
  }, [dateRange])

  const totalNewUsers = useMemo(
    () => chartData.reduce((sum, p) => sum + p.value, 0),
    [chartData],
  )

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className='space-y-6'>
      {/* Hero card */}
      <Card>
        <CardContent>
          <Badge className='rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-100'>Admin Dashboard</Badge>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight'>
            Cộng đồng đang phát triển thế nào?
          </h2>
          <p className='mt-2 max-w-2xl text-sm leading-6'>
            Theo dõi nhịp tăng trưởng của cộng đồng bằng một giao diện trực quan, thoáng đãng và dễ đọc.
          </p>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'>
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className='rounded-xl border-slate-200/70 shadow-sm shadow-sky-100/30'>
                <CardContent className='p-5'>
                  <div className='space-y-3 animate-pulse'>
                    <div className='size-11 rounded-2xl bg-slate-100' />
                    <div className='space-y-2'>
                      <div className='h-3 w-28 rounded bg-slate-100' />
                      <div className='h-8 w-20 rounded bg-slate-100' />
                      <div className='h-3 w-36 rounded bg-slate-100' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : stats.map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.label} className='rounded-xl border-slate-200/70 shadow-sm shadow-sky-100/30'>
                  <CardContent className='p-5'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='space-y-3'>
                        <div className={`flex size-11 items-center justify-center rounded-2xl ${item.tone}`}>
                          <Icon className='size-5' />
                        </div>
                        <div>
                          <p className='text-sm'>{item.label}</p>
                          <p className='mt-1 text-3xl font-semibold tracking-tight'>{item.value}</p>
                          <p className='mt-1 text-xs'>{item.note}</p>
                        </div>
                      </div>
                      <ArrowUpRight className='size-4 text-slate-300' />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
      </div>

      {/* Community Health Chart */}
      <Card>
        <CardHeader className='space-y-4 border-b border-slate-100/80 pb-4'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            {/* Title + summary */}
            <div>
              <CardTitle>Community Health Chart</CardTitle>
              <CardDescription className='mt-1'>
                {chartLoading
                  ? 'Đang tải…'
                  : chartError
                    ? chartError
                    : `${totalNewUsers.toLocaleString('vi-VN')} người dùng mới trong khoảng đã chọn`}
              </CardDescription>
            </div>

            {/* Controls */}
            <div className='flex flex-col gap-3 md:flex-row md:items-center'>
              {/* Period tabs */}
              <Tabs value={period} onValueChange={(v) => { setPeriod(v as Period); setDateRange(undefined) }}>
                <TabsList className='rounded-full bg-slate-100 p-1'>
                  {dateTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className='rounded-full px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm'
                    >
                      <CalendarDays className='mr-2 size-4' />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Custom date range */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className='h-12 min-w-[280px] justify-start rounded-2xl border-slate-200 px-4 text-left font-normal hover:bg-slate-100'
                  >
                    <CalendarDays className='mr-2 size-4 text-slate-400' />
                    <span className='truncate text-slate-500'>{rangeLabel}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align='end' className='w-auto p-0'>
                  <Calendar
                    mode='range'
                    defaultMonth={dateRange?.from ?? new Date()}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    className='rounded-2xl border border-slate-200 p-3 shadow-xl shadow-slate-200/60'
                  />
                  {dateRange && (
                    <div className='flex justify-end px-4 pb-3'>
                      <Button
                        size='sm'
                        variant='ghost'
                        className='text-xs text-slate-500'
                        onClick={() => setDateRange(undefined)}
                      >
                        Xóa bộ lọc
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className='h-[320px] p-2'>
            {chartLoading ? (
              <div className='flex h-full items-center justify-center gap-2 text-muted-foreground'>
                <Loader2 className='size-5 animate-spin' />
                <span className='text-sm'>Đang tải biểu đồ…</span>
              </div>
            ) : chartError ? (
              <div className='flex h-full flex-col items-center justify-center gap-2'>
                <p className='text-sm text-destructive'>{chartError}</p>
                <Button size='sm' variant='outline' onClick={fetchChart}>
                  Thử lại
                </Button>
              </div>
            ) : chartData.length === 0 ? (
              <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
                Không có dữ liệu trong khoảng thời gian này.
              </div>
            ) : (
              <ChartContainer config={communityChartConfig} className='h-full w-full'>
                <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id='fillCommunity' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='var(--color-value)' stopOpacity={0.35} />
                      <stop offset='95%' stopColor='var(--color-value)' stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' vertical={false} />
                  <XAxis
                    dataKey='label'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={32}
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        indicator='dot'
                        labelFormatter={(label) => `Mốc: ${label}`}
                      />
                    }
                  />
                  <Area
                    type='monotone'
                    dataKey='value'
                    stroke='var(--color-value)'
                    strokeWidth={2.5}
                    fill='url(#fillCommunity)'
                    dot={{ r: 3.5, strokeWidth: 2, fill: 'var(--color-value)' }}
                    activeDot={{ r: 5.5 }}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Services */}
      <Card>
        <CardHeader>
          <CardTitle>Top Services</CardTitle>
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
