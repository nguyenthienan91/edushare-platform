import { ArrowUpRight, Zap, Users, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const stats = [
  { label: 'Nhóm mở', value: '08', note: '3 nhóm có thể tham gia', icon: Zap, tone: 'bg-emerald-100 text-emerald-600' },
  {
    label: 'Thành viên đã tham gia',
    value: '248',
    note: 'Tăng dần theo tuần',
    icon: Users,
    tone: 'bg-sky-100 text-sky-600'
  },
  {
    label: 'Ví ký quỹ',
    value: '$45.20',
    note: 'Sẵn sàng cho giao dịch',
    icon: Wallet,
    tone: 'bg-violet-100 text-violet-600'
  }
]

const featured = [
  { name: 'Netflix Premium', meta: '4/5 chỗ', trend: '+12%' },
  { name: 'Spotify Duo', meta: '2/2 chỗ', trend: '+8%' },
  { name: 'YouTube Family', meta: '5/5 chỗ', trend: '+3%' }
]

export default function MemberParticipantPageNew() {
  return (
    <div className='space-y-6 bg-[#f0f9ff]'>
      <div className='rounded-3xl border border-sky-100/80 bg-white p-6 shadow-sm shadow-sky-100/50'>
        <p className='text-sm font-medium text-emerald-600'>Thị trường Member</p>
        <h2 className='mt-2 text-3xl font-semibold tracking-tight text-slate-900'>Khám phá các nhóm đang mở</h2>
        <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-500'>
          Xem những nhóm đang tuyển thành viên, so sánh và tham gia ngay.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className='rounded-3xl border-slate-200/70 bg-white shadow-sm shadow-sky-100/30'>
              <CardContent className='p-5'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='space-y-3'>
                    <div className={`flex size-11 items-center justify-center rounded-2xl ${s.tone}`}>
                      <Icon className='size-5' />
                    </div>
                    <div>
                      <p className='text-sm text-slate-500'>{s.label}</p>
                      <p className='mt-1 text-3xl font-semibold tracking-tight text-slate-900'>{s.value}</p>
                      <p className='mt-1 text-xs text-slate-500'>{s.note}</p>
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
            <CardTitle className='text-slate-900'>Nhóm nổi bật</CardTitle>
            <CardDescription>Những nhóm được quan tâm và có chỗ sẵn để tham gia.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-3'>
              {featured.map((f) => (
                <div key={f.name} className='rounded-2xl border border-slate-100 p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium text-slate-900'>{f.name}</p>
                      <p className='text-sm text-slate-500'>{f.meta}</p>
                    </div>
                    <Badge className='rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-700'>{f.trend}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className='rounded-3xl border-slate-200/70 bg-white shadow-sm shadow-sky-100/30'>
          <CardHeader>
            <CardTitle className='text-slate-900'>Hành động nhanh</CardTitle>
            <CardDescription>Thao tác phổ biến: tham gia nhóm, kiểm tra đơn, cập nhật ví.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <button className='w-full rounded-lg bg-slate-900 text-white py-2'>Khám phá nhóm</button>
              <button className='w-full rounded-lg border border-slate-200 py-2'>Xem đơn hàng</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
