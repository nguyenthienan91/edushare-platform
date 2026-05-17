import { useMemo, useState } from 'react'
import { BanknoteArrowUp, CalendarClock, CircleDollarSign, Landmark, ShieldCheck } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const history = [
  { date: '12/05/2026', type: 'Nạp tiền', amount: '+500.000đ', status: 'Thành công' },
  { date: '11/05/2026', type: 'Rút tiền', amount: '-100.000đ', status: 'Đang xử lý' },
  { date: '10/05/2026', type: 'Escrow hoàn tất', amount: '+250.000đ', status: 'Thành công' },
]

export default function OwnerWallet() {
  const [amount, setAmount] = useState('50000')
  const [bankName, setBankName] = useState('mbbank')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [depositAmount, setDepositAmount] = useState('100000')
  const [depositMethod, setDepositMethod] = useState('bank')

  const quickAmounts = [50000, 100000, 500000]

  const depositQuick = useMemo(() => ['50.000đ', '100.000đ', '500.000đ'], [])

  return (
    <DashboardLayout
      role="owner"
      title="Ví ký quỹ"
      description="Theo dõi số dư và trạng thái tiền trong hệ thống escrow."
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">Số dư khả dụng</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">$120.50</p>
              <Badge className="mt-3 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Đang hoạt động</Badge>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">Tiền đang giữ</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">$48.00</p>
              <p className="mt-3 text-sm text-slate-500">Đang chờ hoàn tất giao dịch</p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">Yêu cầu rút tiền</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">2</p>
              <p className="mt-3 text-sm text-slate-500">Đang chờ duyệt</p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">Tổng giao dịch</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">18</p>
              <p className="mt-3 text-sm text-slate-500">Trong 30 ngày gần nhất</p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Trạng thái escrow</CardTitle>
            <CardDescription>Toàn bộ trạng thái tiền được giữ an toàn trong hệ thống.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            {[
              { title: 'Chờ cấp quyền', desc: 'Đang chờ chủ nhóm xác nhận.' },
              { title: 'Đã xác nhận', desc: 'Người tham gia đã nhận quyền truy cập.' },
              { title: 'Đã giải phóng', desc: 'Tiền đã chuyển về owner.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Hành động nhanh</CardTitle>
            <CardDescription>Thao tác nhanh với ví và giao dịch.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700">Nạp thêm</Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl sm:max-w-[560px]">
                <DialogHeader>
                  <DialogTitle>Nạp tiền vào ví</DialogTitle>
                  <DialogDescription>
                    Chọn phương thức và số tiền muốn nạp.
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={depositMethod} onValueChange={setDepositMethod} className="space-y-5">
                  <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl bg-slate-100 p-1">
                    <TabsTrigger value="bank" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-700">
                      Ngân hàng
                    </TabsTrigger>
                    <TabsTrigger value="qr" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-700">
                      QR / Ví
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="bank" className="space-y-4">
                    <div className="grid gap-2">
                      <Label className="text-slate-700">Số tiền nạp</Label>
                      <Input
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4"
                        placeholder="100000"
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label className="text-slate-700">Nạp nhanh</Label>
                      <div className="flex flex-wrap gap-2">
                        {depositQuick.map((label, index) => {
                          const value = quickAmounts[index]
                          return (
                            <Button
                              key={label}
                              type="button"
                              variant="secondary"
                              className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
                              onClick={() => setDepositAmount(String(value))}
                            >
                              {label}
                            </Button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label className="text-slate-700">Ngân hàng</Label>
                        <Select value={bankName} onValueChange={setBankName}>
                          <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4">
                            <SelectValue placeholder="Chọn ngân hàng" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mbbank">MB Bank</SelectItem>
                            <SelectItem value="vcb">Vietcombank</SelectItem>
                            <SelectItem value="acb">ACB</SelectItem>
                            <SelectItem value="tcb">Techcombank</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700">Số tài khoản</Label>
                        <Input
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4"
                          placeholder="Nhập số tài khoản"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="qr" className="space-y-4">
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                        <CircleDollarSign className="size-6 text-indigo-500" />
                      </div>
                      <p className="mt-4 font-medium text-slate-900">Quét QR để nạp tiền</p>
                      <p className="mt-1 text-sm text-slate-500">Kết nối ví hoặc quét mã QR ngân hàng của ShareBuddy.</p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  Giao dịch nạp tiền sẽ được xác nhận tự động sau khi hệ thống nhận được thanh toán.
                </div>

                <DialogFooter>
                  <Button variant="outline" className="rounded-full">Hủy</Button>
                  <Button className="rounded-full bg-indigo-600 text-white hover:bg-indigo-700">
                    <Landmark className="mr-2 size-4" />
                    Xác nhận nạp
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Xem lịch sử</Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl sm:max-w-[720px]">
                <DialogHeader>
                  <DialogTitle>Lịch sử giao dịch</DialogTitle>
                  <DialogDescription>
                    Theo dõi các giao dịch nạp tiền, rút tiền và escrow gần đây.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={`${item.date}-${item.type}`} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div>
                        <p className="font-medium text-slate-900">{item.type}</p>
                        <p className="text-sm text-slate-500">{item.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{item.amount}</p>
                        <Badge className="mt-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <DialogFooter>
                  <Button className="rounded-full bg-slate-950 text-white hover:bg-slate-800">
                    Đóng
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700">Yêu cầu rút</Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl sm:max-w-[560px]">
                <DialogHeader>
                  <DialogTitle>Rút tiền</DialogTitle>
                  <DialogDescription>
                    Nhập thông tin ngân hàng để gửi yêu cầu rút tiền.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                  <div className="grid gap-2">
                    <Label className="text-slate-700">Số tiền rút</Label>
                    <Input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4"
                      placeholder="50000"
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label className="text-slate-700">Chọn nhanh</Label>
                    <div className="flex flex-wrap gap-2">
                      {quickAmounts.map((value) => (
                        <Button
                          key={value}
                          type="button"
                          variant="secondary"
                          className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
                          onClick={() => setAmount(String(value))}
                        >
                          {value.toLocaleString('vi-VN')} đ
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label className="text-slate-700">Ngân hàng</Label>
                      <Select value={bankName} onValueChange={setBankName}>
                        <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4">
                          <SelectValue placeholder="Chọn ngân hàng" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mbbank">MB Bank</SelectItem>
                          <SelectItem value="vcb">Vietcombank</SelectItem>
                          <SelectItem value="acb">ACB</SelectItem>
                          <SelectItem value="tcb">Techcombank</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-slate-700">Số tài khoản</Label>
                      <Input
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4"
                        placeholder="Nhập số tài khoản"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-slate-700">Tên chủ tài khoản</Label>
                    <Input
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4"
                      placeholder="Nhập tên chủ tài khoản"
                    />
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    Yêu cầu của bạn sẽ được xử lý trong vòng 24h. Cảm ơn bạn đã đồng hành cùng ShareBuddy
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" className="rounded-full">Hủy</Button>
                  <Button className="rounded-full bg-indigo-600 text-white hover:bg-indigo-700">
                    <BanknoteArrowUp className="mr-2 size-4" />
                    Gửi yêu cầu
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
