import { MoreHorizontal, ShieldCheck, Clock, Mail, LifeBuoy, Ban } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const users = [
  {
    id: 'USR-001',
    name: 'Nguyễn Văn A',
    email: 'nva@example.com',
    role: 'Owner',
    trustScore: 95,
    status: 'verified',
    avatar: 'https://i.pravatar.cc/150?u=1'
  },
  {
    id: 'USR-002',
    name: 'Trần Thị B',
    email: 'ttb@example.com',
    role: 'Member',
    trustScore: 82,
    status: 'verified',
    avatar: 'https://i.pravatar.cc/150?u=2'
  },
  {
    id: 'USR-003',
    name: 'Lê Văn C',
    email: 'lvc@example.com',
    role: 'Member',
    trustScore: 45,
    status: 'pending',
    avatar: 'https://i.pravatar.cc/150?u=3'
  },
  {
    id: 'USR-004',
    name: 'Phạm Thị D',
    email: 'ptd@example.com',
    role: 'Owner',
    trustScore: 100,
    status: 'verified',
    avatar: 'https://i.pravatar.cc/150?u=4'
  },
  {
    id: 'USR-005',
    name: 'Hoàng Văn E',
    email: 'hve@example.com',
    role: 'Member',
    trustScore: 60,
    status: 'pending',
    avatar: 'https://i.pravatar.cc/150?u=5'
  }
]

export default function AdminUsers() {
  return (
    <div className='space-y-6 '>
      <Card>
        <CardContent>
          <Badge className='rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-100'>Users</Badge>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight'>Danh sách người dùng</h2>
          <p className='mt-2 max-w-2xl text-sm leading-6'>
            Quản lý, hỗ trợ và theo dõi mức độ uy tín của các thành viên trong cộng đồng EduShare.
          </p>
        </CardContent>
      </Card>

      <Card className='rounded-xl border-slate-200/70  shadow-sm shadow-sky-100/30 overflow-hidden'>
        <CardHeader className='pb-4'>
          <CardTitle className=''>Tất cả người dùng</CardTitle>
          <CardDescription>Danh sách chi tiết các công dân của cộng đồng.</CardDescription>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='overflow-x-auto scrollbar-thin'>
            <Table>
            <TableHeader className='/50'>
              <TableRow className='hover:bg-transparent border-slate-100'>
                <TableHead className='py-4 pl-6 font-medium '>Người dùng</TableHead>
                <TableHead className='py-4 font-medium '>Vai trò</TableHead>
                <TableHead className='py-4 font-medium  w-50'>Độ uy tín (Trust Score)</TableHead>
                <TableHead className='py-4 font-medium '>Trạng thái</TableHead>
                <TableHead className='py-4 pr-6 text-right font-medium '>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className='hover:/30 border-slate-100 transition-colors'>
                  <TableCell className='py-4 pl-6'>
                    <div className='flex items-center gap-4'>
                      <Avatar className='h-10 w-10 border border-slate-100 shadow-sm'>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className='bg-sky-100 text-sky-700'>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='font-medium'>{user.name}</div>
                        <div className='text-sm '>{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='py-4'>
                    <Badge
                      variant='secondary'
                      className={`rounded-xl px-2.5 py-1 text-xs font-medium ${user.role === 'Owner' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 '}`}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className='py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='flex-1 h-2 rounded-full bg-slate-100 overflow-hidden'>
                        <div
                          className={`h-full rounded-full ${user.trustScore >= 80 ? 'bg-emerald-400' : user.trustScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
                          style={{ width: `${user.trustScore}%` }}
                        />
                      </div>
                      <span className='text-sm font-medium  w-8'>{user.trustScore}</span>
                    </div>
                  </TableCell>
                  <TableCell className='py-4'>
                    {user.status === 'verified' ? (
                      <div className='flex items-center gap-1.5 text-emerald-600'>
                        <ShieldCheck className='h-4 w-4' />
                        <span className='text-sm font-medium'>Đã xác minh</span>
                      </div>
                    ) : (
                      <div className='flex items-center gap-1.5 text-amber-600'>
                        <Clock className='h-4 w-4' />
                        <span className='text-sm font-medium'>Chờ xác minh</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className='py-4 pr-6 text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          className='h-8 w-8 p-0 text-slate-400 hover: hover:bg-slate-100 rounded-full'
                        >
                          <span className='sr-only'>Mở menu</span>
                          <MoreHorizontal className='h-5 w-5' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align='end'
                        className='w-48 rounded-2xl p-2 border-slate-100 shadow-lg shadow-slate-200/50'
                      >
                        <DropdownMenuLabel className='text-xs font-medium text-slate-400'>Hành động</DropdownMenuLabel>
                        <DropdownMenuSeparator className='bg-slate-100' />
                        <DropdownMenuItem className='p-2.5 rounded-xl cursor-pointer hover: focus: text-sky-700 transition-colors'>
                          <LifeBuoy className='mr-2 h-4 w-4' />
                          <span>Hỗ trợ người dùng</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className='p-2.5 rounded-xl cursor-pointer hover: focus:  transition-colors'>
                          <Mail className='mr-2 h-4 w-4' />
                          <span>Gửi thông báo</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className='bg-slate-100' />
                        <DropdownMenuItem className='p-2.5 rounded-xl cursor-pointer hover:bg-amber-50 focus:bg-amber-50 text-amber-700 transition-colors'>
                          <Ban className='mr-2 h-4 w-4' />
                          <span>Hạn chế quyền</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
