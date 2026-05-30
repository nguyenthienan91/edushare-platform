import { useState } from 'react'
import { AlertCircle, CheckCircle, Clock, FileText, MessageSquare, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type DisputeStatus = 'pending' | 'under_review' | 'resolved' | 'rejected'

type Message = {
  id: string
  sender: 'user' | 'admin'
  senderName: string
  message: string
  timestamp: string
}

type Dispute = {
  id: string
  orderId: string
  groupName: string
  software: string
  reason: string
  description: string
  status: DisputeStatus
  createdAt: string
  updatedAt: string
  amount: number
  evidence?: string[]
  messages: Message[]
  resolution?: string
}

const disputesData: Dispute[] = [
  {
    id: 'DIS-001',
    orderId: 'ORD-004',
    groupName: 'Canva Pro Shared',
    software: 'Canva',
    reason: 'access_denied',
    description: 'Đã thanh toán escrow nhưng chưa được owner thêm vào nhóm sau 24 giờ.',
    status: 'under_review',
    createdAt: '2025-03-03',
    updatedAt: '2025-03-04',
    amount: 45000,
    evidence: ['payment-screenshot.png', 'owner-chat.pdf'],
    messages: [
      { id: '1', sender: 'user', senderName: 'Nguyễn Văn A', message: 'Mình chưa được thêm vào nhóm sau khi thanh toán escrow.', timestamp: '2025-03-03 14:30' },
      { id: '2', sender: 'admin', senderName: 'Admin Support', message: 'Chúng tôi đã yêu cầu owner xác minh và phản hồi.', timestamp: '2025-03-04 09:15' },
    ],
  },
  {
    id: 'DIS-002',
    orderId: 'ORD-007',
    groupName: 'Microsoft 365 Study Pack',
    software: 'Microsoft 365',
    reason: 'service_disruption',
    description: 'Owner đã add nhưng slot bị remove sau vài ngày sử dụng.',
    status: 'resolved',
    createdAt: '2025-02-28',
    updatedAt: '2025-03-01',
    amount: 30000,
    messages: [],
    resolution: 'Admin quyết định hoàn tiền cho member vì giao dịch không được duy trì đúng cam kết.',
  },
]

export default function MemberDisputesPage() {
  const [filter, setFilter] = useState<string>('all')
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [newMessage, setNewMessage] = useState('')

  const filteredDisputes = disputesData.filter((dispute) => (filter === 'all' ? true : dispute.status === filter))

  const stats = {
    total: disputesData.length,
    pending: disputesData.filter((d) => d.status === 'pending').length,
    under_review: disputesData.filter((d) => d.status === 'under_review').length,
    resolved: disputesData.filter((d) => d.status === 'resolved').length,
  }

  const getStatus = (status: DisputeStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'Đang chờ', color: 'bg-slate-100 ', icon: Clock }
      case 'under_review':
        return { label: 'Đang xem xét', color: 'bg-blue-100 text-blue-700', icon: AlertCircle }
      case 'resolved':
        return { label: 'Đã giải quyết', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle }
      case 'rejected':
        return { label: 'Đã từ chối', color: 'bg-red-100 text-red-700', icon: XCircle }
    }
  }

  const getReason = (reason: string) => {
    const map: Record<string, string> = {
      access_denied: 'Chưa được thêm vào nhóm sau thanh toán',
      service_disruption: 'Dịch vụ bị gián đoạn hoặc bị kick khỏi nhóm',
      incorrect_plan: 'Gói không đúng như mô tả',
      payment_issue: 'Lỗi thanh toán hoặc giải ngân',
      account_removed: 'Tài khoản bị gỡ khỏi nhóm',
    }
    return map[reason] || reason
  }

  return (
    <div className='max-w-7xl mx-auto space-y-6'>
      <Card>
        <CardContent>
          <Badge className='rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-100'>Escrow Dispute Management</Badge>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight '>Tranh chấp & khiếu nại giao dịch</h2>
          <p className='mt-2 max-w-2xl text-sm leading-6 '>Theo dõi các trường hợp member khiếu nại khi chưa được add nhóm hoặc bị gián đoạn dịch vụ.</p>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
        {[
          { label: 'Tổng số', value: stats.total, icon: FileText },
          { label: 'Đang chờ', value: stats.pending, icon: Clock },
          { label: 'Đang xem xét', value: stats.under_review, icon: AlertCircle },
          { label: 'Đã giải quyết', value: stats.resolved, icon: CheckCircle },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className=' border border-slate-200 rounded-2xl p-5 shadow-sm'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-sm '>{item.label}</span>
                <Icon className='w-5 h-5 text-slate-400' />
              </div>
              <div className='text-3xl font-bold '>{item.value}</div>
            </div>
          )
        })}
      </div>

      <div className='flex flex-wrap gap-3'>
        {[
          ['all', 'Tất cả'],
          ['pending', 'Đang chờ'],
          ['under_review', 'Đang xem xét'],
          ['resolved', 'Đã giải quyết'],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === value ? 'bg-slate-900 text-white' : ' border border-slate-200  hover:'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className='space-y-4'>
        {filteredDisputes.length === 0 ? (
          <div className=' border border-slate-200 rounded-2xl p-12 text-center'>
            <FileText className='w-12 h-12 mx-auto mb-3 text-slate-300' />
            <h3 className='text-lg font-semibold '>Không có tranh chấp</h3>
            <p className='text-sm  mt-1'>Bạn chưa có tranh chấp nào.</p>
          </div>
        ) : (
          filteredDisputes.map((dispute) => {
            const status = getStatus(dispute.status)
            const Icon = status.icon
            return (
              <div key={dispute.id} className=' border border-slate-200 rounded-2xl p-6 shadow-sm'>
                <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5'>
                  <div>
                    <div className='flex flex-wrap items-center gap-3 mb-2'>
                      <h3 className='text-lg font-bold '>{dispute.groupName}</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${status.color}`}>
                        <Icon className='w-3 h-3' />
                        {status.label}
                      </div>
                    </div>
                    <div className='text-sm  flex flex-wrap gap-3'>
                      <span>Mã: {dispute.id}</span>
                      <span>•</span>
                      <span>Đơn: {dispute.orderId}</span>
                      <span>•</span>
                      <span>{dispute.createdAt}</span>
                    </div>
                  </div>
                  <div className='text-left lg:text-right'>
                    <div className='text-2xl font-bold '>{dispute.amount.toLocaleString('vi-VN')} ₫</div>
                    <div className='text-xs '>Giá trị tranh chấp</div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <div className='text-sm font-semibold  mb-1'>Lý do</div>
                    <div className='text-sm '>{getReason(dispute.reason)}</div>
                  </div>
                  <div>
                    <div className='text-sm font-semibold  mb-1'>Mô tả</div>
                    <p className=' leading-relaxed'>{dispute.description}</p>
                  </div>

                  {dispute.evidence && dispute.evidence.length > 0 && (
                    <div>
                      <div className='text-sm font-semibold  mb-2'>Bằng chứng</div>
                      <div className='flex flex-wrap gap-2'>
                        {dispute.evidence.map((file) => (
                          <div key={file} className='px-3 py-2  border border-slate-200 rounded-lg text-sm  flex items-center gap-2'>
                            <FileText className='w-4 h-4' />
                            {file}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dispute.resolution && (
                    <div className='bg-emerald-50 border border-emerald-200 rounded-xl p-4'>
                      <div className='flex gap-3'>
                        <CheckCircle className='w-5 h-5 text-emerald-600 mt-0.5' />
                        <div>
                          <div className='font-semibold text-emerald-800 mb-1'>Đã giải quyết</div>
                          <p className='text-sm text-emerald-700'>{dispute.resolution}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-5 mt-5 border-t border-slate-100'>
                  <div className='flex items-center gap-2 text-sm '>
                    <MessageSquare className='w-4 h-4' />
                    <span>{dispute.messages.length} tin nhắn</span>
                  </div>
                  <button onClick={() => setSelectedDispute(dispute)} className='px-4 py-2  border border-slate-200 rounded-xl text-sm font-semibold hover: transition-colors'>
                    Xem chi tiết
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {selectedDispute && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
          <div className=' rounded-3xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col'>
            <div className='p-6 border-b border-slate-100 flex items-center justify-between'>
              <div>
                <h2 className='text-xl font-bold '>Chi tiết tranh chấp</h2>
                <p className='text-sm  mt-1'>#{selectedDispute.id}</p>
              </div>
              <button onClick={() => setSelectedDispute(null)} className='w-10 h-10 rounded-full hover:bg-slate-100 transition-colors flex items-center justify-center'>✕</button>
            </div>

            <div className='flex-1 overflow-y-auto p-6 space-y-4'>
              {selectedDispute.messages.length === 0 ? (
                <div className='text-center  py-10'>Chưa có tin nhắn nào</div>
              ) : (
                selectedDispute.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md rounded-2xl px-4 py-3 ${msg.sender === 'user' ? 'bg-emerald-500 text-white' : 'bg-slate-100 '}`}>
                      <div className='text-xs opacity-70 mb-1'>{msg.senderName}</div>
                      <div className='text-sm'>{msg.message}</div>
                      <div className='text-[11px] opacity-70 mt-2'>{msg.timestamp}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedDispute.status !== 'resolved' && (
              <div className='p-6 border-t border-slate-100'>
                <div className='flex gap-3'>
                  <input
                    type='text'
                    placeholder='Nhập tin nhắn...'
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className='flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  />
                  <button className='px-5 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors'>Gửi</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
