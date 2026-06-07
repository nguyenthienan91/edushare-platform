import { Users, PlayCircle, Eye, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const groups = [
  {
    id: 'GRP-001',
    name: 'Netflix Premium 4K - Family',
    service: 'Netflix',
    owner: { name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?u=1' },
    members: 4,
    maxMembers: 5,
    status: 'active'
  },
  {
    id: 'GRP-002',
    name: 'Spotify Family (1 year)',
    service: 'Spotify',
    owner: { name: 'Phạm Thị D', avatar: 'https://i.pravatar.cc/150?u=4' },
    members: 6,
    maxMembers: 6,
    status: 'completed'
  },
  {
    id: 'GRP-003',
    name: 'Youtube Premium - No Ads',
    service: 'Youtube Premium',
    owner: { name: 'Trần Văn C', avatar: 'https://i.pravatar.cc/150?u=12' },
    members: 6,
    maxMembers: 6,
    status: 'flagged'
  },
  {
    id: 'GRP-004',
    name: 'Disney+ (Share)',
    service: 'Disney+',
    owner: { name: 'Hoàng Thị E', avatar: 'https://i.pravatar.cc/150?u=22' },
    members: 2,
    maxMembers: 4,
    status: 'active'
  },
  {
    id: 'GRP-005',
    name: 'Netflix UHD (Đang tuyển)',
    service: 'Netflix',
    owner: { name: 'Lê Tuấn M', avatar: 'https://i.pravatar.cc/150?u=33' },
    members: 1,
    maxMembers: 5,
    status: 'flagged'
  }
]

const getServiceTone = (service: string) => {
  switch (service) {
    case 'Netflix':
      return 'bg-rose-100 text-rose-700 border-rose-200'
    case 'Spotify':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'Youtube Premium':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'Disney+':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200'
    default:
      return 'bg-slate-100  border-slate-200'
  }
}

export default function AdminGroups() {
  const renderGroupCards = (status: string) => {
    const filteredGroups = groups.filter((g) => g.status === status)

    if (filteredGroups.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center p-12 text-center text-slate-400  rounded-3xl border border-dashed border-slate-200'>
          <PlayCircle className='h-12 w-12 mb-4 text-slate-200' />
          <p>Không có nhóm nào trong danh mục này.</p>
        </div>
      )
    }

    return (
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {filteredGroups.map((group) => (
          <Card
            key={group.id}
            className='rounded-3xl border-slate-200/70  shadow-sm shadow-sky-100/30 overflow-hidden flex flex-col hover:border-sky-200 hover:shadow-md transition-all'
          >
            <CardHeader className='pb-4'>
              <div className='flex items-start justify-between'>
                <Badge
                  variant='outline'
                  className={`rounded-xl px-2.5 py-0.5 text-xs font-medium border ${getServiceTone(group.service)}`}
                >
                  {group.service}
                </Badge>
                {group.status === 'flagged' && (
                  <Badge
                    variant='secondary'
                    className='bg-amber-100/80 text-amber-700 hover:bg-amber-100 border-none rounded-xl px-2'
                  >
                    <ShieldAlert className='w-3 h-3 mr-1' /> Có báo cáo
                  </Badge>
                )}
              </div>
              <CardTitle className='text-lg  mt-3 line-clamp-1'>{group.name}</CardTitle>
              <CardDescription className='text-xs'>{group.id}</CardDescription>
            </CardHeader>
            <CardContent className='pb-4 flex-1'>
              <div className='flex items-center gap-3 mb-4'>
                <Avatar className='h-8 w-8 border border-slate-100 shadow-sm'>
                  <AvatarImage src={group.owner.avatar} alt={group.owner.name} />
                  <AvatarFallback className='bg-sky-100 text-sky-700 text-xs'>
                    {group.owner.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='text-xs '>Chủ nhóm</p>
                  <p className='text-sm font-medium '>{group.owner.name}</p>
                </div>
              </div>

              <div className='flex items-center justify-between text-sm   p-3 rounded-2xl'>
                <div className='flex items-center gap-1.5'>
                  <Users className='w-4 h-4 text-slate-400' />
                  <span>Thành viên</span>
                </div>
                <span className='font-medium '>
                  {group.members} / {group.maxMembers}
                </span>
              </div>
            </CardContent>
            <CardFooter className='pt-0 pb-5 px-6 border-t border-slate-50 mt-auto flex justify-end'>
              <Button
                variant='outline'
                size='sm'
                className='rounded-xl text-sky-700 border-sky-200 hover: mt-4 w-full'
              >
                <Eye className='w-4 h-4 mr-2' /> XEM BẰNG CHỨNG
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-6 '>
      <Card>
        <CardContent>
        <p className='text-sm font-medium text-emerald-600'>Quản lý hoạt động</p>
        <h2 className='mt-2 text-3xl font-semibold tracking-tight '>Danh sách Nhóm</h2>
        <p className='mt-2 max-w-2xl text-sm leading-6 '>
          Theo dõi các nhóm chia sẻ, kiểm tra bằng chứng giao dịch và xử lý các vấn đề nội bộ.
        </p>
        </CardContent>
      </Card>

      <Tabs defaultValue='active' className='w-full'>
        <div className='flex items-center justify-between mb-6 w-full'>
          <TabsList className='flex w-full overflow-x-auto justify-start gap-1 p-1 h-auto sm:grid sm:grid-cols-3 border border-slate-200/60 rounded-2xl shadow-sm scrollbar-none'>
            <TabsTrigger
              value='active'
              className='rounded-xl px-5 py-2.5 text-sm data-[state=active]:0 data-[state=active]:text-white data-[state=active]:shadow-sm'
            >
              Đang hoạt động{' '}
              <Badge className='ml-2 /20 text-white hover:/20 border-none px-1.5 rounded-md'>2</Badge>
            </TabsTrigger>
            <TabsTrigger
              value='flagged'
              className='rounded-xl px-5 py-2.5 text-sm data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-sm'
            >
              Bị báo cáo (Flagged){' '}
              <Badge className='ml-2 /20 text-white hover:/20 border-none px-1.5 rounded-md'>2</Badge>
            </TabsTrigger>
            <TabsTrigger
              value='completed'
              className='rounded-xl px-5 py-2.5 text-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-sm'
            >
              Đã hoàn thành{' '}
              <Badge className='ml-2 /20 text-white hover:/20 border-none px-1.5 rounded-md'>1</Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='active' className='mt-0 outline-none'>
          {renderGroupCards('active')}
        </TabsContent>
        <TabsContent value='flagged' className='mt-0 outline-none'>
          {renderGroupCards('flagged')}
        </TabsContent>
        <TabsContent value='completed' className='mt-0 outline-none'>
          {renderGroupCards('completed')}
        </TabsContent>
      </Tabs>
    </div>
  )
}
