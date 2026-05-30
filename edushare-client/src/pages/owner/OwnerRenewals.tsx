import { Bell, CalendarDays, Clock3, Sparkles } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from "sonner"

const renewals = [
  { name: 'Netflix Premium', due: 'Còn 3 ngày', members: 4, status: 'Sắp hết hạn' },
  { name: 'YouTube Family', due: 'Còn 5 ngày', members: 5, status: 'Cần chú ý' },
  { name: 'Spotify Duo', due: 'Còn 7 ngày', members: 2, status: 'Bình thường' },
]

export default function OwnerRenewals() {

  const handleNotify = () => {
    toast.success('Đã gửi lời nhắc thân thiện đến các thành viên!')
  }

  return (
    <DashboardLayout
      role="owner"
      title="Nhắc gia hạn"
      description="Theo dõi các nhóm sắp hết hạn và gửi lời nhắc nhanh chóng."
    >
      <div className="space-y-6 ">
        <div className="rounded-3xl border border-sky-100/80  p-6 shadow-sm shadow-sky-100/50">
          <Badge className="rounded-full bg-sky-100 text-sky-700 hover:bg-sky-100">Renewal Center</Badge>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight ">Nhắc nhở gia hạn</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 ">
            Danh sách nhóm cần chú ý được xếp lên đầu tiên để bạn dễ theo dõi và gửi thông báo kịp thời.
          </p>
        </div>

        <Alert variant="warning" className="border-amber-200 bg-amber-50 text-amber-900">
          <Sparkles className="size-4 text-amber-500" />
          <AlertTitle>Nhóm sắp đến hạn</AlertTitle>
          <AlertDescription>
            Một vài nhóm sắp hết hạn trong tuần này. Hãy nhắc thành viên sớm để tránh gián đoạn.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-3xl border-slate-200/70  shadow-sm shadow-sky-100/30">
            <CardHeader>
              <CardTitle className="">Danh sách nhóm cần chú ý</CardTitle>
              <CardDescription>Các nhóm được ưu tiên theo thời gian sắp hết hạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {renewals.map((group) => (
                <div key={group.name} className="rounded-2xl border border-slate-200  p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium ">{group.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-sm ">
                        <Clock3 className="size-4" />
                        {group.due}
                      </div>
                    </div>
                    <Badge
                      className={
                        group.status === 'Sắp hết hạn'
                          ? 'rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100'
                          : group.status === 'Cần chú ý'
                            ? 'rounded-full bg-sky-100 text-sky-700 hover:bg-sky-100'
                            : 'rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                      }
                    >
                      {group.status}
                    </Badge>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 text-sm ">
                    <span>{group.members} thành viên</span>
                    <Button
                      type="button"
                      onClick={handleNotify}
                      className="rounded-full bg-amber-400 text-white hover:bg-amber-500"
                    >
                      <Bell className="mr-2 size-4" />
                      Nhắc mọi người
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200/70  shadow-sm shadow-sky-100/30">
            <CardHeader>
              <CardTitle className="">Gợi ý nhanh</CardTitle>
              <CardDescription>Những điều nên làm để giữ cộng đồng ổn định.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl  p-4">
                <p className="font-medium ">Gửi nhắc trước 3 ngày</p>
                <p className="mt-1 text-sm leading-6 ">
                  Gửi lời nhắc sớm giúp thành viên chủ động gia hạn và tránh gián đoạn.
                </p>
              </div>
              <div className="rounded-2xl  p-4">
                <p className="font-medium ">Theo dõi phản hồi</p>
                <p className="mt-1 text-sm leading-6 ">
                  Nếu nhóm chưa phản hồi, hãy ưu tiên liên hệ lại bằng một tin nhắn thân thiện.
                </p>
              </div>
              <Button className="w-full rounded-full bg-indigo-600 text-white hover:bg-indigo-700">
                <CalendarDays className="mr-2 size-4" />
                Xem lịch gia hạn
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
