import { useState } from 'react'
import { Check, X, Building, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

// Mock Data
const initialWithdrawals = [
  {
    id: 'WDR-001',
    owner: { name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?u=1' },
    amount: 1250000,
    bank: 'Vietcombank - 0123456789',
    date: '10:30 AM - 13/05/2026',
    status: 'pending'
  },
  {
    id: 'WDR-002',
    owner: { name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?u=2' },
    amount: 500000,
    bank: 'Techcombank - 9876543210',
    date: '09:15 AM - 13/05/2026',
    status: 'completed'
  },
  {
    id: 'WDR-003',
    owner: { name: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?u=3' },
    amount: 3200000,
    bank: 'MB Bank - 1122334455',
    date: '16:45 PM - 12/05/2026',
    status: 'rejected'
  },
  {
    id: 'WDR-004',
    owner: { name: 'Phạm Thị D', avatar: 'https://i.pravatar.cc/150?u=4' },
    amount: 850000,
    bank: 'ACB - 5566778899',
    date: '08:20 AM - 13/05/2026',
    status: 'pending'
  }
]

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const handleApprove = (id: string, name: string) => {
    setWithdrawals((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'completed' } : item)))
    toast.success(`Đã phê duyệt thành công! 🎉`, {
      description: `Đã chuyển tiền vào tài khoản của ${name}`,
      duration: 4000
    })
  }

  const handleReject = (id: string) => {
    setWithdrawals((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'rejected' } : item)))
    toast.error(`Đã từ chối yêu cầu rút tiền`, {
      description: 'Lời nhắn từ chối đã được gửi đến Owner'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant='secondary'
            className='bg-amber-100 text-amber-700 hover:bg-amber-100/80 rounded-xl px-3 py-1 font-medium border-none flex w-max items-center gap-1.5'
          >
            <Clock className='w-3.5 h-3.5' /> Đang chờ
          </Badge>
        )
      case 'completed':
        return (
          <Badge
            variant='secondary'
            className='bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 rounded-xl px-3 py-1 font-medium border-none flex w-max items-center gap-1.5'
          >
            <CheckCircle2 className='w-3.5 h-3.5' /> Đã chuyển
          </Badge>
        )
      case 'rejected':
        return (
          <Badge
            variant='secondary'
            className='bg-rose-100 text-rose-700 hover:bg-rose-100/80 rounded-xl px-3 py-1 font-medium border-none flex w-max items-center gap-1.5'
          >
            <XCircle className='w-3.5 h-3.5' /> Từ chối
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardContent>
          <Badge className='rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-100'>Quản lý Tài chính</Badge>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight'>Phê duyệt rút tiền</h2>
          <p className='mt-2 max-w-2xl text-sm leading-6'>
            Kiểm tra tài khoản và xác nhận chuyển tiền hoa hồng cho các Chủ nhóm (Owner).
          </p>
        </CardContent>
      </Card>

      <Card >
        <CardHeader className='pb-4'>
          <CardTitle>Danh sách yêu cầu mới nhất</CardTitle>
          <CardDescription>Danh sách tự động cập nhật khi có Owner yêu cầu rút tiền về ví.</CardDescription>
        </CardHeader>
        <CardContent className='p-0'>
          <Table>
            <TableHeader className='/50'>
              <TableRow className='hover:bg-transparent border-slate-100'>
                <TableHead className='py-4 pl-6 font-medium '>Chủ nhóm (Owner)</TableHead>
                <TableHead className='py-4 font-medium '>Số tiền yêu cầu</TableHead>
                <TableHead className='py-4 font-medium '>Thông tin Ngân hàng</TableHead>
                <TableHead className='py-4 font-medium '>Thời gian duyệt</TableHead>
                <TableHead className='py-4 font-medium '>Trạng thái</TableHead>
                <TableHead className='py-4 pr-6 text-right font-medium '>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((item) => (
                <TableRow key={item.id} className='hover:/50 border-slate-100 transition-colors'>
                  <TableCell className='py-4 pl-6'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-9 w-9 border border-slate-100 shadow-sm'>
                        <AvatarImage src={item.owner.avatar} alt={item.owner.name} />
                        <AvatarFallback className='bg-sky-100 text-sky-700'>{item.owner.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className='font-medium '>{item.owner.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className='py-4'>
                    <div className='font-semibold '>{formatCurrency(item.amount)}</div>
                  </TableCell>
                  <TableCell className='py-4'>
                    <div className='flex items-center gap-2  text-sm'>
                      <Building className='w-4 h-4 text-slate-400' />
                      {item.bank}
                    </div>
                  </TableCell>
                  <TableCell className='py-4'>
                    <div className='text-sm '>{item.date}</div>
                  </TableCell>
                  <TableCell className='py-4'>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className='py-4 pr-6 text-right'>
                    {item.status === 'pending' ? (
                      <div className='flex items-center justify-end gap-2'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleReject(item.id)}
                          className='h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-full'
                          title='Từ chối'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                        <Button
                          size='sm'
                          onClick={() => handleApprove(item.id, item.owner.name)}
                          className='h-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all active:scale-95'
                        >
                          <Check className='h-4 w-4 mr-1' /> Phê duyệt
                        </Button>
                      </div>
                    ) : (
                      <span className='text-xs text-slate-400 italic'>Đã xử lý</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
