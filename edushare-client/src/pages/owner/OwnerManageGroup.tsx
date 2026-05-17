import { DashboardLayout } from '@/components/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BadgeCheck,
  CirclePlus,
  Search,
  ShieldCheck,
  Trash2,
  Users
} from 'lucide-react'
import { useMemo, useState } from 'react'

const groups = [
  { id: 1, name: 'Netflix Premium', members: 3, total: 5, status: 'Đang chờ', productType: 'Streaming' },
  { id: 2, name: 'YouTube Family', members: 4, total: 4, status: 'Đã đủ', productType: 'Streaming' },
  { id: 3, name: 'Spotify Duo', members: 1, total: 2, status: 'Cần gia hạn', productType: 'Music' },
  { id: 4, name: 'Disney+ Shared', members: 2, total: 6, status: 'Đang chờ', productType: 'Streaming' },
]

const pendingMembers = [
  { name: 'Nguyễn Văn A', email: 'a@gmail.com', role: 'Pending' },
  { name: 'Trần Thị B', email: 'b@gmail.com', role: 'Pending' },
]

const joinedMembers = [
  { name: 'Lê Minh C', email: 'c@gmail.com', role: 'Joined' },
  { name: 'Phạm Thảo D', email: 'd@gmail.com', role: 'Joined' },
  { name: 'Hà Anh E', email: 'e@gmail.com', role: 'Joined' },
]

const statusVariants = {
  'Đang chờ': 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  'Đã đủ': 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  'Cần gia hạn': 'bg-sky-100 text-sky-700 hover:bg-sky-100',
} as const

const productTypes = ['Tất cả', ...new Set(groups.map((group) => group.productType))]

export default function OwnerManageGroup() {
  const [query, setQuery] = useState('')
  const [productType, setProductType] = useState('Tất cả')
  const [selectedGroup, setSelectedGroup] = useState(groups[0])

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const matchesQuery = group.name.toLowerCase().includes(query.toLowerCase())
      const matchesProductType = productType === 'Tất cả' || group.productType === productType

      return matchesQuery && matchesProductType
    })
  }, [query, productType])

  return (
    <DashboardLayout
      role="owner"
      title="Quản lý nhóm của tôi"
      description="Theo dõi trạng thái nhóm, tiến độ slot và thực hiện hành động nhanh."
    >
      <div className="space-y-8 bg-[#f0f9ff]">
        <div className="rounded-3xl border border-sky-100/80 bg-white p-6 shadow-sm shadow-sky-100/40">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">Manage Group</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Quản lý nhóm của tôi</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Xem nhanh trạng thái từng nhóm, tiến độ lấp đầy slot và các thao tác quan trọng ngay dưới card.
              </p>
            </div>
            <Button className="rounded-full bg-indigo-600 text-white hover:bg-indigo-700">
              <CirclePlus className="mr-2 size-4" />
              Tạo nhóm mới
            </Button>
          </div>
        </div>

        <Card className="rounded-3xl border-slate-200/70 bg-white shadow-sm shadow-sky-100/30">
          <CardContent className="p-4 md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative w-full md:max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm nhóm..."
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11"
                />
              </div>

              <div className="w-full md:w-64">
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger className="!h-12 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 text-slate-700">
                    <SelectValue placeholder="Lọc theo loại sản phẩm" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredGroups.map((group) => {
            const progress = Math.round((group.members / group.total) * 100)

            return (
              <Card key={group.id} className="rounded-2xl border-slate-200/70 bg-white shadow-sm shadow-sky-100/30">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl text-slate-900">{group.name}</CardTitle>
                      <CardDescription className="mt-1 text-sm text-slate-500">
                        {group.members}/{group.total} thành viên
                      </CardDescription>
                    </div>
                    <Badge className={`rounded-full ${statusVariants[group.status as keyof typeof statusVariants]}`}>
                      {group.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Độ lấp đầy</span>
                      <span className="font-medium text-slate-900">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5 bg-slate-100" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Slot còn lại</p>
                      <p className="mt-1 font-semibold text-slate-900">{group.total - group.members} slot</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Trạng thái</p>
                      <p className="mt-1 font-semibold text-slate-900">{group.status}</p>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
                        onClick={() => setSelectedGroup(group)}
                      >
                        Manage Members
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="min-w-[90vw] rounded-3xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Manage Members - {selectedGroup.name}</DialogTitle>
                        <DialogDescription>
                          Danh sách người dùng đang chờ duyệt và người dùng đã tham gia.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-6 lg:grid-cols-2">
                        <Card className="rounded-2xl border-slate-200 shadow-sm">
                          <CardHeader className="border-b border-slate-100 pb-3">
                            <CardTitle className="text-base">Pending</CardTitle>
                            <CardDescription>Người dùng đang chờ duyệt.</CardDescription>
                          </CardHeader>
                          <CardContent className="p-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Tên</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {pendingMembers.map((member) => (
                                  <TableRow key={member.email}>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>
                                      <div className="flex justify-end gap-2">
                                        <Button size="sm" className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600">
                                          <ShieldCheck className="mr-2 size-4" />
                                          Approve
                                        </Button>
                                        <Button size="sm" variant="outline" className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50">
                                          <Trash2 className="mr-2 size-4" />
                                          Remove
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>

                        <Card className="rounded-2xl border-slate-200 shadow-sm">
                          <CardHeader className="border-b border-slate-100 pb-3">
                            <CardTitle className="text-base">Joined</CardTitle>
                            <CardDescription>Người dùng đã tham gia nhóm.</CardDescription>
                          </CardHeader>
                          <CardContent className="p-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Tên</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead className="text-right">Trạng thái</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {joinedMembers.map((member) => (
                                  <TableRow key={member.email}>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell className="text-right">
                                      <Badge className="rounded-full bg-sky-100 text-sky-700 hover:bg-sky-100">
                                        <BadgeCheck className="mr-1 size-3.5" />
                                        Joined
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" variant="outline" className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                      <Users className="mr-2 size-4" />
                      Member List
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                      <Trash2 className="mr-2 size-4" />
                      Remove Group
                    </Button>
                    <Button size="sm" className="rounded-full bg-indigo-600 text-white hover:bg-indigo-700">
                      Quick Action
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
