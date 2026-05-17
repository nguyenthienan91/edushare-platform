import { Download, TrendingUp, HandCoins, CreditCard, Percent } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

// Mock Data
const monthlyData = [
  { name: 'Tháng 1', revenue: 4000, profit: 800 },
  { name: 'Tháng 2', revenue: 4500, profit: 900 },
  { name: 'Tháng 3', revenue: 5200, profit: 1040 },
  { name: 'Tháng 4', revenue: 6100, profit: 1220 },
  { name: 'Tháng 5', revenue: 8000, profit: 1600 },
  { name: 'Tháng 6', revenue: 9500, profit: 1900 }
]

const servicesData = [
  { name: 'Netflix', value: 45, color: '#f43f5e' },
  { name: 'Spotify', value: 25, color: '#10b981' },
  { name: 'Youtube', value: 20, color: '#ef4444' },
  { name: 'Khác', value: 10, color: '#64748b' }
]

export default function AdminRevenue() {
  const formatCurrency = (value: number) => `$${value}`

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='rounded-3xl border border-sky-100/80 bg-white p-6 shadow-sm shadow-sky-100/50 flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
        <div>
          <p className='text-sm font-medium text-emerald-600'>Thống kê tài chính</p>
          <h2 className='mt-2 text-3xl font-semibold tracking-tight text-slate-900'>Doanh thu & Hoa hồng</h2>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-500'>
            Theo dõi tổng khối lượng giao dịch, lợi nhuận từ phí nền tảng và báo cáo tình hình tăng trưởng.
          </p>
        </div>
        <Button className='rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 hover:text-sky-700 shadow-none border border-sky-200/50 flex shrink-0'>
          <Download className='mr-2 h-4 w-4' /> Xuất báo cáo PDF
        </Button>
      </div>

      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card className='rounded-3xl border-slate-200/70 bg-white shadow-sm shadow-sky-100/30'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-slate-500'>Tổng phí thu được (Tháng này)</p>
              <div className='p-2 bg-emerald-100 rounded-xl'>
                <HandCoins className='h-5 w-5 text-emerald-600' />
              </div>
            </div>
            <div className='mt-4'>
              <h3 className='text-3xl font-bold text-slate-900'>$1,900</h3>
              <p className='flex items-center mt-1 text-sm text-emerald-600 font-medium'>
                <TrendingUp className='h-4 w-4 mr-1' /> +18.5% so với tháng trước
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='rounded-3xl border-slate-200/70 bg-white shadow-sm shadow-sky-100/30'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-slate-500'>Tổng giao dịch trên sàn</p>
              <div className='p-2 bg-sky-100 rounded-xl'>
                <CreditCard className='h-5 w-5 text-sky-600' />
              </div>
            </div>
            <div className='mt-4'>
              <h3 className='text-3xl font-bold text-slate-900'>$9,500</h3>
              <p className='flex items-center mt-1 text-sm text-sky-600 font-medium'>
                <TrendingUp className='h-4 w-4 mr-1' /> +22.4% so với tháng trước
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='rounded-3xl border-slate-200/70 bg-white shadow-sm shadow-sky-100/30'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-slate-500'>Tỉ lệ giữ chân</p>
              <div className='p-2 bg-violet-100 rounded-xl'>
                <Percent className='h-5 w-5 text-violet-600' />
              </div>
            </div>
            <div className='mt-4'>
              <h3 className='text-3xl font-bold text-slate-900'>92.4%</h3>
              <p className='flex items-center mt-1 text-sm text-slate-500 font-medium'>Người dùng gia hạn tự động</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className='grid gap-4 lg:grid-cols-3'>
        {/* Bar Chart - Revenue Growth */}
        <Card className='rounded-3xl border-slate-200/70 bg-white shadow-sm shadow-sky-100/30 lg:col-span-2'>
          <CardHeader>
            <CardTitle className='text-lg text-slate-800'>Tốc độ tăng trưởng</CardTitle>
            <CardDescription>So sánh Khối lượng giao dịch và Lợi nhuận phí nền tảng trong 6 tháng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-80 w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#e2e8f0' />
                  <XAxis
                    dataKey='name'
                    axisLine={false}
                    tickLine={false}
                    tick={{ padding: 10, fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatCurrency}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend iconType='circle' wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
                  <Bar dataKey='revenue' name='Tổng giao dịch' fill='#bae6fd' radius={[6, 6, 6, 6]} barSize={24} />
                  <Bar dataKey='profit' name='Phí thu được' fill='#0284c7' radius={[6, 6, 6, 6]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Services Breakdown */}
        <Card className='rounded-3xl border-slate-200/70 bg-white shadow-sm shadow-sky-100/30'>
          <CardHeader>
            <CardTitle className='text-lg text-slate-800'>Tỷ trọng Dịch vụ</CardTitle>
            <CardDescription>Đóng góp doanh thu của các nền tảng tháng này</CardDescription>
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
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
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
                    <span className='text-slate-600 font-medium'>{service.name}</span>
                  </div>
                  <span className='text-slate-900 font-bold'>{service.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
