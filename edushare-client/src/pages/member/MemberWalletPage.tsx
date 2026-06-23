import { useEffect, useMemo, useState } from 'react'
import { BanknoteArrowUp, CircleDollarSign, Landmark, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fetchClient } from '@/utils/fetchClient'

export default function MemberWalletPage() {
  const [wallet, setWallet] = useState<{ balance: number; frozenBalance: number } | null>(null)
  const [historyData, setHistoryData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const [amount, setAmount] = useState('50000')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [depositAmount, setDepositAmount] = useState('100000')
  const [depositMethod, setDepositMethod] = useState('bank')
  const [bankAccounts, setBankAccounts] = useState<any[]>([])
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>('')

  const quickAmounts = [50000, 100000, 500000]
  const depositQuick = useMemo(() => ['50.000đ', '100.000đ', '500.000đ'], [])

  const fetchWalletData = async () => {
    try {
      const walletRes = await fetchClient('/wallets/me')
      setWallet(walletRes)
      
      const historyRes = await fetchClient('/wallets/history?page=1&itemPerPage=50')
      if (historyRes && historyRes.list) {
        setHistoryData(historyRes.list)
      }

      const bankRes = await fetchClient('/bank-accounts')
      setBankAccounts(bankRes || [])
      
      const defaultAccount = (bankRes || []).find((acc: any) => acc.isDefault) || (bankRes || [])[0]
      if (defaultAccount) {
        setSelectedBankAccountId(defaultAccount._id)
        setBankName(defaultAccount.bankName)
        setAccountNumber(defaultAccount.accountNumber)
        setAccountName(defaultAccount.accountName)
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error)
    }
  }

  const handleSelectBankAccount = (id: string) => {
    setSelectedBankAccountId(id)
    const acc = bankAccounts.find(a => a._id === id)
    if (acc) {
      setBankName(acc.bankName)
      setAccountNumber(acc.accountNumber)
      setAccountName(acc.accountName)
    }
  }

  useEffect(() => {
    fetchWalletData()
  }, [])

  const handleDeposit = async () => {
    const amountNum = Number(depositAmount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Vui lòng nhập số tiền nạp hợp lệ')
      return
    }
    setLoading(true)
    try {
      const res = await fetchClient('/payment-gateway/create-link', {
        method: 'POST',
        body: JSON.stringify({ amount: amountNum }),
      })
      if (res && res.checkoutUrl) {
        window.open(res.checkoutUrl, '_blank')
        toast.success('Đã mở cổng thanh toán PayOS. Vui lòng hoàn thành giao dịch.')
        setIsDepositOpen(false)
        fetchWalletData()
      } else {
        toast.error('Không nhận được link thanh toán từ hệ thống')
      }
    } catch (error: any) {
      console.error('Lỗi khi nạp tiền:', error)
      toast.error(error.message || 'Lỗi khi tạo link thanh toán')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    const amountNum = Number(amount)
    if (isNaN(amountNum) || amountNum < 50000) {
      toast.error('Số tiền rút tối thiểu là 50.000đ')
      return
    }
    if (!bankName) {
      toast.error('Vui lòng chọn ngân hàng')
      return
    }
    if (!accountNumber.trim()) {
      toast.error('Vui lòng nhập số tài khoản')
      return
    }
    if (!accountName.trim()) {
      toast.error('Vui lòng nhập tên chủ tài khoản')
      return
    }

    // Tên chủ tài khoản: uppercase và không dấu
    const cleanAccountName = accountName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/Đ/g, 'D')
      .replace(/đ/g, 'd')
      .toUpperCase()
      .trim()

    if (!/^[A-Z0-9\s]+$/.test(cleanAccountName)) {
      toast.error('Tên chủ tài khoản chỉ được chứa chữ cái không dấu và số')
      return
    }

    setLoading(true)
    try {
      await fetchClient('/withdrawals', {
        method: 'POST',
        body: JSON.stringify({
          amount: amountNum,
          bankName,
          accountNumber: accountNumber.trim(),
          accountName: cleanAccountName,
        }),
      })

      toast.success('Tạo lệnh rút thành công, vui lòng đợi Admin duyệt trong 24h')
      setIsWithdrawOpen(false)
      // Reset form
      setAmount('50000')
      setAccountNumber('')
      setAccountName('')
      fetchWalletData()
    } catch (error: any) {
      console.error('Lỗi khi rút tiền:', error)
      toast.error(error.message || 'Lỗi khi gửi yêu cầu rút tiền')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <Badge variant="default">Thành công</Badge>
      case 'pending':
        return <Badge variant="secondary">Đang xử lý</Badge>
      case 'rejected':
        return <Badge variant="destructive">Bị từ chối</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const pendingWithdrawalsCount = useMemo(() => {
    return historyData.filter(item => item.type === 'withdrawal' && item.status === 'pending').length
  }, [historyData])

  const totalTransactionsCount = historyData.length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Số dư khả dụng</p>
            <p className="mt-2 text-3xl font-bold">
              {(wallet?.balance ?? 0).toLocaleString('vi-VN')} đ
            </p>
            <Badge className="mt-3 rounded-full" variant="outline">Đang hoạt động</Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Số dư đóng băng</p>
            <p className="mt-2 text-3xl font-bold">
              {(wallet?.frozenBalance ?? 0).toLocaleString('vi-VN')} đ
            </p>
            <p className="mt-3 text-sm text-muted-foreground">Đang chờ hoàn tất giao dịch</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Yêu cầu rút tiền</p>
            <p className="mt-2 text-3xl font-bold">{pendingWithdrawalsCount}</p>
            <p className="mt-3 text-sm text-muted-foreground">Đang chờ duyệt</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Tổng giao dịch</p>
            <p className="mt-2 text-3xl font-bold">{totalTransactionsCount}</p>
            <p className="mt-3 text-sm text-muted-foreground">Trong 30 ngày gần nhất</p>
          </CardContent>
        </Card>
      </div>

      {/* <Card>
        <CardHeader>
          <CardTitle>Trạng thái escrow</CardTitle>
          <CardDescription>Toàn bộ trạng thái tiền được giữ an toàn trong hệ thống.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          {[
            { title: 'Chờ cấp quyền', desc: 'Đang chờ chủ nhóm xác nhận.' },
            { title: 'Đã xác nhận', desc: 'Người tham gia đã nhận quyền truy cập.' },
            { title: 'Đã giải phóng', desc: 'Tiền đã chuyển về chủ nhóm (Owner).' },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border p-5">
              <p className="font-medium">{item.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </CardContent>
      </Card> */}

      <Card>
        <CardHeader>
          <CardTitle>Hành động nhanh</CardTitle>
          <CardDescription>Thao tác nhanh với ví và giao dịch.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {/* Dialog Nạp tiền */}
          <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-md">Nạp thêm</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle>Nạp tiền vào ví</DialogTitle>
                <DialogDescription>
                  Chọn phương thức và số tiền muốn nạp.
                </DialogDescription>
              </DialogHeader>

              <Tabs value={depositMethod} onValueChange={setDepositMethod} className="space-y-5">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="bank">
                    Ngân hàng
                  </TabsTrigger>
                  <TabsTrigger value="qr">
                    QR / Ví
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="bank" className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Số tiền nạp</Label>
                    <Input
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="100000"
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label>Nạp nhanh</Label>
                    <div className="flex flex-wrap gap-2">
                      {depositQuick.map((label, index) => {
                        const value = quickAmounts[index]
                        return (
                          <Button
                            key={label}
                            type="button"
                            variant="secondary"
                            className="rounded-md"
                            onClick={() => setDepositAmount(String(value))}
                          >
                            {label}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="qr" className="space-y-4">
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full border">
                      <CircleDollarSign className="size-6" />
                    </div>
                    <p className="mt-4 font-medium">Quét QR để nạp tiền</p>
                    <p className="mt-1 text-sm text-muted-foreground">Kết nối ví hoặc quét mã QR ngân hàng của EduShare.</p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="rounded-lg bg-secondary p-4 text-sm leading-6">
                Giao dịch nạp tiền sẽ được xác nhận tự động sau khi hệ thống nhận được thanh toán từ PayOS.
              </div>

              <DialogFooter>
                <Button variant="outline" className="rounded-md" onClick={() => setIsDepositOpen(false)}>Hủy</Button>
                <Button 
                  className="rounded-md"
                  onClick={handleDeposit}
                  disabled={loading}
                >
                  <Landmark className="mr-2 size-4" />
                  {loading ? 'Đang tạo link...' : 'Xác nhận nạp'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog Rút tiền */}
          <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-md">Yêu cầu rút</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle>Rút tiền</DialogTitle>
                <DialogDescription>
                  Nhập thông tin ngân hàng để gửi yêu cầu rút tiền.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-2">
                <div className="grid gap-2">
                  <Label>Số tiền rút (Tối thiểu 50.000đ)</Label>
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="50000"
                  />
                </div>

                <div className="grid gap-3">
                  <Label>Chọn nhanh</Label>
                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant="secondary"
                        className="rounded-md"
                        onClick={() => setAmount(String(value))}
                      >
                        {value.toLocaleString('vi-VN')} đ
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Tài khoản nhận tiền</Label>
                  {bankAccounts.length === 0 ? (
                    <div className="text-xs text-amber-600 border border-amber-500/20 bg-amber-500/10 p-3 rounded-md leading-relaxed">
                      Bạn chưa liên kết tài khoản ngân hàng nào. Vui lòng truy cập trang <strong>Cài đặt tài khoản &gt; Thanh toán</strong> để thêm tài khoản trước khi thực hiện rút tiền.
                    </div>
                  ) : (
                    <Select value={selectedBankAccountId} onValueChange={handleSelectBankAccount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankAccounts.map((acc) => (
                          <SelectItem key={acc._id} value={acc._id}>
                            {acc.bankName} - {acc.accountNumber} ({acc.accountName}){acc.isDefault ? ' [Mặc định]' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Số tài khoản</Label>
                    <Input
                      value={accountNumber}
                      disabled
                      className="bg-muted cursor-not-allowed"
                      placeholder="Số tài khoản tự động điền"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Tên chủ tài khoản</Label>
                    <Input
                      value={accountName}
                      disabled
                      className="bg-muted cursor-not-allowed"
                      placeholder="Tên chủ tài khoản tự động điền"
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-secondary p-4 text-sm leading-6">
                  Yêu cầu của bạn sẽ được xử lý trong vòng 24h. Cảm ơn bạn đã đồng hành cùng EduShare.
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" className="rounded-md" onClick={() => setIsWithdrawOpen(false)}>Hủy</Button>
                <Button 
                  className="rounded-md"
                  onClick={handleWithdraw}
                  disabled={loading || bankAccounts.length === 0}
                >
                  <BanknoteArrowUp className="mr-2 size-4" />
                  {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog Xem Lịch Sử */}
          <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-md">Xem lịch sử</Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[720px]">
              <DialogHeader>
                <DialogTitle>Lịch sử giao dịch</DialogTitle>
                <DialogDescription>
                  Theo dõi các giao dịch nạp tiền và rút tiền gần đây.
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-[400px] overflow-y-auto overflow-x-auto scrollbar-thin rounded-lg border">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-[180px]">Ngày tạo</TableHead>
                      <TableHead>Loại giao dịch</TableHead>
                      <TableHead className="text-right">Số tiền</TableHead>
                      <TableHead className="text-center w-[120px]">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          Không có giao dịch nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      historyData.map((item) => (
                        <TableRow key={item.id || item._id}>
                          <TableCell className="font-medium">
                            {new Date(item.createdAt).toLocaleString('vi-VN')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${item.type === 'topup' ? 'bg-primary' : 'bg-destructive'}`} />
                              {item.type === 'topup' ? 'Nạp tiền' : 'Rút tiền'}
                            </div>
                          </TableCell>
                          <TableCell className='text-right font-semibold'>
                            {item.status === 'pending' ? (
                              <span className='inline-flex items-center text-muted-foreground font-semibold'>
                                {item.amount.toLocaleString('vi-VN')}đ
                              </span>
                            ) : item.type === 'topup' ? (
                              <span className='inline-flex items-center text-emerald-600 dark:text-emerald-400 font-bold'>
                                <Plus className='mr-0.5 size-3.5 shrink-0' />
                                {item.amount.toLocaleString('vi-VN')}đ
                              </span>
                            ) : (
                              <span className='inline-flex items-center text-rose-600 dark:text-rose-400 font-bold'>
                                <Minus className='mr-0.5 size-3.5 shrink-0' />
                                {item.amount.toLocaleString('vi-VN')}đ
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(item.status)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <DialogFooter>
                <Button className="rounded-md" onClick={() => setIsHistoryOpen(false)}>
                  Đóng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Table Lịch sử giao dịch trực tiếp trên trang */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Lịch sử giao dịch gần đây</CardTitle>
            <CardDescription>Danh sách các giao dịch nạp và rút tiền gần nhất.</CardDescription>
          </div>
          <Button variant="ghost" className="rounded-md" onClick={() => setIsHistoryOpen(true)}>
            Xem chi tiết
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Ngày tạo</TableHead>
                  <TableHead>Loại giao dịch</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead className="text-center w-[120px]">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.slice(0, 5).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Không có giao dịch nào
                    </TableCell>
                  </TableRow>
                ) : (
                  historyData.slice(0, 5).map((item) => (
                    <TableRow key={item.id || item._id}>
                      <TableCell className="font-medium">
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.type === 'topup' ? 'bg-primary' : 'bg-destructive'}`} />
                          {item.type === 'topup' ? 'Nạp tiền' : 'Rút tiền'}
                        </div>
                      </TableCell>
                      <TableCell className='text-right font-semibold'>
                        {item.status === 'pending' ? (
                          <span className='inline-flex items-center text-muted-foreground font-semibold'>
                            {item.amount.toLocaleString('vi-VN')}đ
                          </span>
                        ) : item.type === 'topup' ? (
                          <span className='inline-flex items-center text-emerald-600 dark:text-emerald-400 font-bold'>
                            <Plus className='mr-0.5 size-3.5 shrink-0' />
                            {item.amount.toLocaleString('vi-VN')}đ
                          </span>
                        ) : (
                          <span className='inline-flex items-center text-rose-600 dark:text-rose-400 font-bold'>
                            <Minus className='mr-0.5 size-3.5 shrink-0' />
                            {item.amount.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(item.status)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
