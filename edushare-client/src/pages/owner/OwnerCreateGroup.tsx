import { useMemo, useState } from 'react'
import { ArrowRight, Sparkles, Users } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

export default function OwnerCreateGroup() {
  const [groupName, setGroupName] = useState('Netflix Premium')
  const [serviceType, setServiceType] = useState('video')
  const [slotCount, setSlotCount] = useState([5])
  const [totalPrice, setTotalPrice] = useState(150000)
  const [welcome, setWelcome] = useState('Chào mừng bạn đến với nhóm! Hãy cùng chia sẻ an toàn, văn minh và vui vẻ.')

  const pricePerPerson = useMemo(() => Math.round(totalPrice / slotCount[0]), [totalPrice, slotCount])

  return (
    <DashboardLayout
      role="owner"
      title="Tạo nhóm mới"
      description="Thiết kế một nhóm chia sẻ mới với form tối giản và live preview."
    >
      <div className="space-y-6 ">
        <div className="rounded-xl border border-sky-100/80  p-6 shadow-sm shadow-sky-100/50">
          <Badge className="rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-100">Create Group</Badge>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight ">
            Tạo nhóm mới
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 ">
            Xây dựng một cộng đồng nhỏ với cảm giác thân thiện, tin tưởng và rõ ràng ngay từ đầu.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-xl border-slate-200/70  shadow-sm shadow-sky-100/30">
            <CardHeader>
              <CardTitle className="">Thông tin nhóm</CardTitle>
              <CardDescription>Điền thông tin cơ bản để bắt đầu nhóm chia sẻ của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-2">
                <Label className="">Tên nhóm</Label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="h-12 rounded-2xl border-slate-200  px-4"
                  placeholder="VD: Netflix Premium"
                />
              </div>

              <div className="grid gap-2">
                <Label className="">Loại dịch vụ</Label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-200  px-4">
                    <SelectValue placeholder="Chọn loại dịch vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="ai">AI</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="">Số lượng thành viên (Slot)</Label>
                <div className="rounded-2xl border border-slate-200  p-4">
                  <div className="mb-3 flex items-center justify-between text-sm ">
                    <span>Slot hiện tại</span>
                    <span className="font-medium ">{slotCount[0]} người</span>
                  </div>
                  <Slider
                    value={slotCount}
                    onValueChange={setSlotCount}
                    min={2}
                    max={20}
                    step={1}
                    className="py-2"
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="">Tổng giá nhóm</Label>
                  <Input
                    type="number"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(Number(e.target.value || 0))}
                    className="h-12 rounded-2xl border-slate-200  px-4"
                    placeholder="150000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="">Giá mỗi người</Label>
                  <Input
                    value={`${pricePerPerson.toLocaleString('vi-VN')} VND`}
                    readOnly
                    className="h-12 rounded-2xl border-slate-200  px-4 "
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="">Lời chào mừng thành viên</Label>
                <textarea
                  value={welcome}
                  onChange={(e) => setWelcome(e.target.value)}
                  className="min-h-[120px] rounded-2xl border border-slate-200  px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400"
                  placeholder="Viết lời chào mừng cho các thành viên mới..."
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button variant="outline" className="rounded-full border-indigo-200  text-indigo-700 hover:bg-indigo-50">
                  Lưu nháp
                </Button>
                <Button className="rounded-full bg-indigo-600 text-white hover:bg-indigo-700">
                  Tạo nhóm <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-slate-200/70  shadow-sm shadow-sky-100/30">
            <CardHeader>
              <CardTitle className="">Live Preview Card</CardTitle>
              <CardDescription>Xem trước giao diện nhóm của bạn ngay khi chỉnh form.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl  from-sky-50 to-white p-5 ring-1 ring-sky-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full  px-3 py-1 text-xs font-medium text-sky-700 shadow-sm">
                      <Sparkles className="size-3.5" />
                      Live Preview
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold ">{groupName || 'Tên nhóm của bạn'}</h3>
                    <p className="mt-1 text-sm ">{serviceType === 'video' ? 'Video' : serviceType === 'audio' ? 'Audio' : serviceType === 'ai' ? 'AI' : 'Gaming'} community</p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                    <Users className="size-5" />
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl  p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm ">
                      <span>Slot</span>
                      <span>{slotCount[0]} người</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold ">{pricePerPerson.toLocaleString('vi-VN')} VND / người</p>
                  </div>

                  <div className="rounded-2xl  p-4 shadow-sm">
                    <p className="text-sm font-medium ">Lời chào</p>
                    <p className="mt-2 text-sm leading-6 ">{welcome || 'Chưa có lời chào mừng.'}</p>
                  </div>

                  <div className="rounded-2xl  p-4 shadow-sm">
                    <p className="text-sm font-medium ">Tổng giá</p>
                    <p className="mt-2 text-2xl font-semibold ">{totalPrice.toLocaleString('vi-VN')} VND</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
