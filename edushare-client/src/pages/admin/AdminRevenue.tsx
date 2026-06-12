import { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp,
  TrendingDown,
  HandCoins,
  CreditCard,
  Percent,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardService, type RevenueSummary, type RevenueChartPoint } from '@/services/dashboard.service'

// ─── Static pie chart data ────────────────────────────────────────────────────
const servicesData = [
  { name: 'Nạp tiền', value: 55, color: '#0284c7' },
  { name: 'VIP', value: 30, color: '#7c3aed' },
  { name: 'Khác', value: 15, color: '#64748b' },
]

// ─── Period options ───────────────────────────────────────────────────────────
type Period = 'day' | 'week' | 'month' | 'year'
const PERIOD_TABS: { value: Period; label: string }[] = [
  { value: 'day', label: '7 ngày' },
  { value: 'week', label: '7 tuần' },
  { value: 'month', label: '12 tháng' },
  { value: 'year', label: '5 năm' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatVND = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

const formatAxisVND = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return String(value)
}

const formatTooltipVND = (value: number) => formatVND(value)

function GrowthLabel({ growthPercent }: { growthPercent: number | null }) {
  if (growthPercent === null)
    return <p className='mt-1 text-xs text-slate-400'>Không có dữ liệu tháng trước</p>
  const isUp = growthPercent >= 0
  return (
    <p className={`flex items-center mt-1 text-sm font-medium ${isUp ? 'text-emerald-600' : 'text-rose-500'}`}>
      {isUp ? <TrendingUp className='h-4 w-4 mr-1' /> : <TrendingDown className='h-4 w-4 mr-1' />}
      {isUp ? '+' : ''}{growthPercent}% so với tháng trước
    </p>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminRevenue() {
  // ── summary cards state ────────────────────────────────────────────────────
  const [summary, setSummary] = useState<RevenueSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  // ── revenue chart state ────────────────────────────────────────────────────
  const [chartPeriod, setChartPeriod] = useState<Period>('month')
  const [chartData, setChartData] = useState<RevenueChartPoint[]>([])
  const [chartLoading, setChartLoading] = useState(true)
  const [chartError, setChartError] = useState<string | null>(null)

  // ── fetch summary ──────────────────────────────────────────────────────────
  const fetchSummary = async () => {
    setSummaryLoading(true)
    setSummaryError(null)
    try {
      const res = await DashboardService.getRevenueSummary()
      setSummary(res.data)
    } catch (err: unknown) {
      setSummaryError(err instanceof Error ? err.message : 'Không thể tải dữ liệu')
    } finally {
      setSummaryLoading(false)
    }
  }

  // ── fetch chart ────────────────────────────────────────────────────────────
  const fetchChart = useCallback(async () => {
    setChartLoading(true)
    setChartError(null)
    try {
      const res = await DashboardService.getRevenueChart(chartPeriod)
      setChartData(res.data ?? [])
    } catch (err: unknown) {
      setChartError(err instanceof Error ? err.message : 'Không thể tải biểu đồ')
    } finally {
      setChartLoading(false)
    }
  }, [chartPeriod])

  useEffect(() => { fetchSummary() }, [])
  useEffect(() => { fetchChart() }, [fetchChart])

  // ─── render summary cards ──────────────────────────────────────────────────
  const renderSummaryCards = () => {
    if (summaryLoading) {
      return (
        <div className='grid gap-4 md:grid-cols-3'>
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardContent className='p-6 flex items-center justify-center h-[120px]'>
                <Loader2 className='h-6 w-6 animate-spin text-slate-300' />
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (summaryError || !summary) {
      return (
        <div className='rounded-xl border border-dashed border-rose-200 bg-rose-50/40 p-6 text-center text-rose-500'>
          <p className='text-sm font-medium'>{summaryError ?? 'Không thể tải dữ liệu'}</p>
          <Button variant='outline' size='sm' className='mt-3 text-rose-600 border-rose-200' onClick={fetchSummary}>
            Thử lại
          </Button>
        </div>
      )
    }

    return (
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-slate-600'>Tổng phí thu được (Tháng này)</p>
              <div className='p-2 bg-emerald-100 rounded-xl'>
                <HandCoins className='h-5 w-5 text-emerald-600' />
              </div>
            </div>
            <div className='mt-4'>
              <h3 className='text-3xl font-bold tracking-tight'>{formatVND(summary.feeThisMonth.total)}</h3>
              <GrowthLabel growthPercent={summary.feeThisMonth.growthPercent} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-slate-600'>Tổng giao dịch trên sàn</p>
              <div className='p-2 bg-sky-100 rounded-xl'>
                <CreditCard className='h-5 w-5 text-sky-600' />
              </div>
            </div>
            <div className='mt-4'>
              <h3 className='text-3xl font-bold tracking-tight'>{formatVND(summary.transactionThisMonth.total)}</h3>
              <GrowthLabel growthPercent={summary.transactionThisMonth.growthPercent} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-slate-600'>Tỉ lệ giữ chân</p>
              <div className='p-2 bg-violet-100 rounded-xl'>
                <Percent className='h-5 w-5 text-violet-600' />
              </div>
            </div>
            <div className='mt-4'>
              <h3 className='text-3xl font-bold tracking-tight'>{summary.retentionRate.percent}%</h3>
              <p className='mt-1 text-xs text-slate-400'>
                {summary.retentionRate.totalSubscribed.toLocaleString('vi-VN')} /{' '}
                {summary.retentionRate.totalActive.toLocaleString('vi-VN')} user có subscription
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── render bar chart ──────────────────────────────────────────────────────
  const renderBarChart = () => {
    if (chartLoading) {
      return (
        <div className='h-80 flex items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-sky-400' />
        </div>
      )
    }

    if (chartError) {
      return (
        <div className='h-80 flex flex-col items-center justify-center text-rose-500 gap-3'>
          <p className='text-sm font-medium'>{chartError}</p>
          <Button variant='outline' size='sm' className='text-rose-600 border-rose-200' onClick={fetchChart}>
            Thử lại
          </Button>
        </div>
      )
    }

    if (chartData.length === 0) {
      return (
        <div className='h-80 flex items-center justify-center text-slate-400 text-sm'>
          Không có dữ liệu trong khoảng thời gian này.
        </div>
      )
    }

    return (
      <div className='h-80 w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#e2e8f0' />
            <XAxis
              dataKey='label'
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={formatAxisVND}
              tick={{ fill: '#64748b', fontSize: 12 }}
              width={60}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number, name: string) => [
                formatTooltipVND(value),
                name === 'topup' ? 'Nạp tiền' : name === 'vip' ? 'VIP' : 'Tổng',
              ]}
            />
            <Legend
              iconType='circle'
              wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }}
              formatter={(value) =>
                value === 'topup' ? 'Nạp tiền' : value === 'vip' ? 'VIP' : 'Tổng'
              }
            />
            <Bar dataKey='topup' name='topup' fill='#bae6fd' radius={[6, 6, 0, 0]} barSize={20} stackId='a' />
            <Bar dataKey='vip' name='vip' fill='#7c3aed' radius={[6, 6, 0, 0]} barSize={20} stackId='a' />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // ─── main render ──────────────────────────────────────────────────────────
  return (
    <div className='space-y-6'>
      {/* Header */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <Badge className='rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-100'>
                Thống kê tài chính
              </Badge>
              <h2 className='mt-3 text-3xl font-semibold tracking-tight'>Doanh thu & Hoa hồng</h2>
              <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-500'>
                Theo dõi tổng khối lượng giao dịch, lợi nhuận từ phí nền tảng và báo cáo tình hình tăng trưởng.
              </p>
            </div>
            <Button
              variant='outline'
              size='sm'
              className='rounded-xl shrink-0'
              onClick={() => { fetchSummary(); fetchChart() }}
              disabled={summaryLoading || chartLoading}
            >
              {(summaryLoading || chartLoading) ? (
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
              ) : (
                <RefreshCw className='h-3.5 w-3.5' />
              )}
              <span className='ml-1.5 text-xs'>Làm mới</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {renderSummaryCards()}

      {/* Charts */}
      <div className='grid gap-4 lg:grid-cols-3'>
        {/* Bar Chart — Real API */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <div className='flex items-center justify-between gap-4 flex-wrap'>
              <div>
                <CardTitle className='text-lg'>Tốc độ tăng trưởng doanh thu</CardTitle>
                <CardDescription className='mt-1'>
                  So sánh doanh thu nạp tiền và VIP theo từng kỳ
                </CardDescription>
              </div>
              {/* Period selector */}
              <Tabs value={chartPeriod} onValueChange={(v) => setChartPeriod(v as Period)}>
                <TabsList className='h-8 gap-0.5 p-0.5 rounded-xl border border-slate-200'>
                  {PERIOD_TABS.map((t) => (
                    <TabsTrigger
                      key={t.value}
                      value={t.value}
                      className='h-7 px-3 text-xs rounded-lg data-[state=active]:bg-sky-600 data-[state=active]:text-white'
                    >
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>{renderBarChart()}</CardContent>
        </Card>

        {/* Pie Chart — Static */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Tỷ trọng Dịch vụ</CardTitle>
            <CardDescription>Đóng góp doanh thu của các nguồn</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col items-center justify-center'>
            <div className='h-60 w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={servicesData}
                    cx='50%'
                    cy='50%'
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey='value'
                    stroke='none'
                  >
                    {servicesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    itemStyle={{ color: '#0f172a' }}
                    formatter={(value: number) => [`${value}%`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className='w-full mt-4 space-y-2'>
              {servicesData.map((service, index) => (
                <div key={index} className='flex items-center justify-between text-sm'>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 rounded-full' style={{ backgroundColor: service.color }} />
                    <span className='font-medium text-slate-700'>{service.name}</span>
                  </div>
                  <span className='font-bold text-slate-800'>{service.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
