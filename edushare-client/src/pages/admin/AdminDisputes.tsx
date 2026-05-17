import { useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Image as ImageIcon,
  History,
  Undo2,
  XCircle,
  ShieldCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

// Mock Data
const disputes = [
  {
    id: 'DSP-092',
    title: 'Không truy cập được Netflix',
    groupName: 'Netflix Premium 4K - Family',
    member: { name: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?u=3' },
    owner: { name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?u=1' },
    status: 'pending',
    date: '2 giờ trước',
    unread: true
  },
  {
    id: 'DSP-091',
    title: 'Tài khoản Spotify bị văng',
    groupName: 'Spotify Family (1 year)',
    member: { name: 'Hoàng Thị E', avatar: 'https://i.pravatar.cc/150?u=5' },
    owner: { name: 'Phạm Thị D', avatar: 'https://i.pravatar.cc/150?u=4' },
    status: 'investigating',
    date: '5 giờ trước',
    unread: false
  },
  {
    id: 'DSP-090',
    title: 'Chủ nhóm không phản hồi',
    groupName: 'Youtube Premium - No Ads',
    member: { name: 'Trịnh Văn F', avatar: 'https://i.pravatar.cc/150?u=6' },
    owner: { name: 'Trần Văn C', avatar: 'https://i.pravatar.cc/150?u=12' },
    status: 'pending',
    date: '1 ngày trước',
    unread: false
  }
]

const messages = [
  {
    id: 1,
    sender: 'Lê Văn C',
    role: 'member',
    content:
      'Admin ơi, tài khoản Netflix nay tự nhiên báo sai mật khẩu. Mình nhắn cho chủ nhóm từ tối qua đến giờ chưa thấy rep.',
    time: '09:00 AM',
    avatar: 'https://i.pravatar.cc/150?u=3'
  },
  {
    id: 2,
    sender: 'Nguyễn Văn A',
    role: 'owner',
    content: 'Xin lỗi bạn nha, tối qua mình bận quá chưa check tin nhắn. Mật khẩu mới đây nhé bạn: NetFlix@2026',
    time: '10:30 AM',
    avatar: 'https://i.pravatar.cc/150?u=1'
  },
  {
    id: 3,
    sender: 'Lê Văn C',
    role: 'member',
    content: 'Vẫn không được bạn ơi, nó báo vượt quá số thiết bị truy cập rồi. Không vào xem được gì cả.',
    time: '10:35 AM',
    avatar: 'https://i.pravatar.cc/150?u=3'
  }
]

const evidences = [
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=400&auto=format&fit=crop'
]

export default function AdminDisputes() {
  const [selectedId, setSelectedId] = useState(disputes[0].id)

  const currentDispute = disputes.find((d) => d.id === selectedId) || disputes[0]

  return (
    <div className='space-y-6  min-h-[calc(100vh-(--spacing(20)))]'>
      <div className='rounded-3xl border border-amber-100/60 bg-white p-6 shadow-sm shadow-amber-100/40'>
        <p className='text-sm font-medium text-amber-600'>Trung tâm hòa giải</p>
        <h2 className='mt-2 text-3xl font-semibold tracking-tight text-slate-900'>Quản lý Khiếu nại</h2>
        <p className='mt-2 text-sm leading-6 text-slate-500'>
          Xử lý tranh chấp giữa các thành viên bằng góc nhìn khách quan. Ưu tiên sự đồng thuận và duy trì môi trường
          chia sẻ tích cực.
        </p>
      </div>

      <div className='grid gap-6 lg:grid-cols-[380px_1fr] items-start'>
        {/* Left Column: List of Disputes */}
        <Card className='rounded-3xl border-slate-200/70 bg-white shadow-sm overflow-hidden flex flex-col h-[calc(100vh-230px)]'>
          <CardHeader className='py-5 px-6 border-b border-slate-50 bg-amber-50/30'>
            <CardTitle className='text-lg flex items-center gap-2'>
              <History className='w-5 h-5 text-amber-500' /> Đang chờ xử lý
            </CardTitle>
          </CardHeader>
          <ScrollArea className='flex-1 overflow-y-auto'>
            <div className='p-3 space-y-2'>
              {disputes.map((dispute) => (
                <button
                  key={dispute.id}
                  onClick={() => setSelectedId(dispute.id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${
                    selectedId === dispute.id
                      ? 'bg-amber-50 border-amber-200 shadow-sm'
                      : 'bg-white border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className='flex items-start justify-between mb-2'>
                    <Badge
                      variant='outline'
                      className={`text-[10px] rounded-lg px-2 border-none ${
                        dispute.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {dispute.status === 'pending' ? 'Chờ xử lý' : 'Đang điều tra'}
                    </Badge>
                    <span className='text-[11px] text-slate-400 font-medium'>{dispute.date}</span>
                  </div>
                  <h4
                    className={`font-medium text-sm leading-snug mb-1 ${selectedId === dispute.id ? 'text-amber-900' : 'text-slate-800'}`}
                  >
                    {dispute.title}
                  </h4>
                  <p className='text-xs text-slate-500 mb-3 line-clamp-1'>{dispute.groupName}</p>
                  <div className='flex items-center gap-4 text-xs font-medium'>
                    <div className='flex items-center gap-1.5 opacity-80'>
                      <Avatar className='h-5 w-5'>
                        <AvatarImage src={dispute.member.avatar} />
                      </Avatar>
                      <span className='text-slate-600'>{dispute.member.name}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Right Column: Dispute Detail & Action */}
        <div className=' flex flex-col gap-6 h-[calc(100vh-230px)]'>
          <Card className='rounded-3xl border-slate-200/70 bg-white shadow-sm flex-1 flex flex-col overflow-hidden'>
            {/* Header Detail */}
            <div className='p-6 border-b border-slate-100 flex items-center justify-between bg-linear-to-r from-amber-50/50 to-white'>
              <div>
                <div className='flex items-center gap-2 mb-2'>
                  <Badge
                    variant='secondary'
                    className='bg-amber-100 text-amber-700 text-xs rounded-lg hover:bg-amber-100 border-none'
                  >
                    {currentDispute.id}
                  </Badge>
                  <span className='text-sm font-medium text-slate-500'>{currentDispute.groupName}</span>
                </div>
                <h3 className='text-xl font-semibold text-slate-800'>{currentDispute.title}</h3>
              </div>

              <div className='flex items-center gap-4'>
                <div className='flex flex-col items-center'>
                  <Avatar className='h-10 w-10 ring-2 ring-slate-100 mb-1'>
                    <AvatarImage src={currentDispute.member.avatar} />
                  </Avatar>
                  <span className='text-[10px] font-medium text-slate-500'>Người khiếu nại</span>
                </div>
                <ChevronRight className='w-4 h-4 text-slate-300' />
                <div className='flex flex-col items-center'>
                  <Avatar className='h-10 w-10 ring-2 ring-amber-100 mb-1'>
                    <AvatarImage src={currentDispute.owner.avatar} />
                  </Avatar>
                  <span className='text-[10px] font-medium text-amber-600'>Chủ nhóm</span>
                </div>
              </div>
            </div>

            {/* Conversation & Evidence */}
            <ScrollArea className='flex-1 p-6 overflow-y-auto'>
              <div className='space-y-6'>
                {/* Evidence Section */}
                <div className='bg-slate-50 rounded-2xl p-4 border border-slate-100'>
                  <h4 className='flex items-center gap-2 text-sm font-medium text-slate-700 mb-3'>
                    <ImageIcon className='w-4 h-4' /> Bằng chứng gửi kèm
                  </h4>
                  <ScrollArea className='w-full whitespace-nowrap rounded-xl'>
                    <div className='flex w-max space-x-3 pb-4'>
                      {evidences.map((src, i) => (
                        <div
                          key={i}
                          className='relative rounded-xl overflow-hidden group cursor-pointer border border-slate-200'
                        >
                          <img
                            src={src}
                            alt='Evidence'
                            className='h-32 w-48 object-cover transition-transform group-hover:scale-105'
                          />
                        </div>
                      ))}
                    </div>
                    <ScrollBar orientation='horizontal' />
                  </ScrollArea>
                </div>

                <Separator className='bg-slate-100' />

                {/* Chat History */}
                <div>
                  <h4 className='flex items-center gap-2 text-sm font-medium text-slate-700 mb-4'>
                    <MessageSquare className='w-4 h-4' /> Lịch sử trao đổi
                  </h4>
                  <div className='space-y-4'>
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex gap-3 ${msg.role === 'owner' ? 'flex-row-reverse' : ''}`}>
                        <Avatar className='h-8 w-8 mt-1'>
                          <AvatarImage src={msg.avatar} />
                        </Avatar>
                        <div className={`flex flex-col ${msg.role === 'owner' ? 'items-end' : 'items-start'}`}>
                          <div className='flex items-center gap-2 mb-1'>
                            <span className='text-xs font-medium text-slate-600'>{msg.sender}</span>
                            <span className='text-[10px] text-slate-400'>{msg.time}</span>
                          </div>
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] ${
                              msg.role === 'owner'
                                ? 'bg-amber-100 text-amber-900 rounded-tr-sm'
                                : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Resolution Actions */}
            <div className='p-4 border-t border-slate-100 bg-white flex items-center justify-end gap-3 mt-auto'>
              <Button variant='ghost' className='text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl'>
                <XCircle className='w-4 h-4 mr-2' /> Đóng khiếu nại
              </Button>
              <Button variant='outline' className='text-amber-700 border-amber-200 hover:bg-amber-50 rounded-xl'>
                <Undo2 className='w-4 h-4 mr-2' /> Giao Owner xử lý lại
              </Button>
              <Button className='bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm'>
                <ShieldCheck className='w-4 h-4 mr-2' /> Hoàn tiền cho Member
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
