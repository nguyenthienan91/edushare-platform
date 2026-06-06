import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, Clock, FileText, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fetchClient } from '@/utils/fetchClient'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { DisputeDetailDialog } from '@/components/escrow/DisputeDetailDialog'

export default function MemberDisputesPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<string>('all')
  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null)
  const fetchMyDisputes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchClient('/disputes/me?page=1&itemPerPage=50')
      if (res && res.status === 'success') {
        const list = res.list || res.data || []
        setDisputes(list)
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh sách khiếu nại.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMyDisputes()
  }, [fetchMyDisputes])

  const filteredDisputes = disputes.filter((dispute) => {
    if (filter === 'all') return true
    if (filter === 'pending') return dispute.status === 'pending'
    if (filter === 'resolved') return dispute.status === 'resolved_refund' || dispute.status === 'resolved_payout'
    return true
  })

  const stats = {
    total: disputes.length,
    pending: disputes.filter((d) => d.status === 'pending').length,
    resolved: disputes.filter((d) => d.status === 'resolved_refund' || d.status === 'resolved_payout').length,
  }

  const getStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Đang chờ', color: 'bg-amber-500/10 text-amber-600', icon: Clock }
      case 'resolved_refund':
        return { label: 'Đã hoàn tiền (Member thắng)', color: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle }
      case 'resolved_payout':
        return { label: 'Đã giải ngân (Owner thắng)', color: 'bg-primary/10 text-primary', icon: CheckCircle }
      default:
        return { label: status, color: 'bg-muted text-muted-foreground', icon: Clock }
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
          <Badge variant='secondary' className='rounded-full'>Escrow Dispute Management</Badge>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight'>Tranh chấp & khiếu nại giao dịch</h2>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-muted-foreground'>
            Theo dõi các trường hợp member khiếu nại khi chưa được add nhóm hoặc bị gián đoạn dịch vụ.
          </p>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
        {[
          { label: 'Tổng số khiếu nại', value: stats.total, icon: FileText },
          { label: 'Đang chờ xử lý', value: stats.pending, icon: Clock },
          { label: 'Đã giải quyết', value: stats.resolved, icon: CheckCircle },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className='border rounded-lg p-5 bg-card'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-sm text-muted-foreground'>{item.label}</span>
                <Icon className='w-5 h-5 text-muted-foreground' />
              </div>
              <div className='text-3xl font-bold'>{item.value}</div>
            </div>
          )
        })}
      </div>

      <div className='flex flex-wrap gap-3'>
        {[
          ['all', 'Tất cả'],
          ['pending', 'Đang chờ'],
          ['resolved', 'Đã giải quyết'],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              filter === value 
                ? 'bg-primary text-primary-foreground' 
                : 'border bg-card hover:bg-muted text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className='space-y-4'>
        {loading ? (
          <div className='flex justify-center items-center py-20'>
            <Loader2 className='w-8 h-8 animate-spin text-muted-foreground' />
          </div>
        ) : filteredDisputes.length === 0 ? (
          <div className='border rounded-lg p-12 text-center bg-card shadow-sm'>
            <FileText className='w-12 h-12 mx-auto mb-3 text-muted-foreground/40' />
            <h3 className='text-lg font-semibold'>Không có tranh chấp</h3>
            <p className='text-sm text-muted-foreground mt-1'>Bạn chưa có hoặc không có khiếu nại nào phù hợp bộ lọc.</p>
          </div>
        ) : (
          filteredDisputes.map((dispute) => {
            const status = getStatus(dispute.status)
            const Icon = status.icon
            const isOwner = user?.userID === dispute.transactionId?.groupId?.ownerId
            return (
              <div key={dispute._id} className='border rounded-lg p-6 shadow-sm bg-card hover:shadow-md transition duration-200'>
                <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5'>
                  <div>
                    <div className='flex flex-wrap items-center gap-3 mb-2'>
                      <h3 className='text-lg font-bold truncate max-w-full'>{dispute.transactionId?.groupId?.name || 'Nhóm dùng chung'}</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${status.color}`}>
                        <Icon className='w-3 h-3' />
                        {status.label}
                      </div>
                      {isOwner && (
                        <Badge className='bg-secondary text-secondary-foreground border-none rounded-full px-2.5 py-0.5 text-xs font-medium'>Chủ nhóm</Badge>
                      )}
                    </div>
                    <div className='text-xs text-muted-foreground flex flex-wrap gap-3 font-medium'>
                      <span>Mã: {dispute._id.substring(dispute._id.length - 8).toUpperCase()}</span>
                      <span>•</span>
                      <span>Đơn: {dispute.transactionId?._id?.substring(dispute.transactionId?._id?.length - 8).toUpperCase()}</span>
                      <span>•</span>
                      <span>{new Date(dispute.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                  <div className='text-left lg:text-right'>
                    <div className='text-2xl font-bold'>
                      {(dispute.transactionId?.amount || 0).toLocaleString('vi-VN')} ₫
                    </div>
                    <div className='text-xs text-muted-foreground font-medium'>Giá trị tranh chấp</div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <div className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1'>Lý do khiếu nại</div>
                    <div className='text-sm font-medium'>{getReason(dispute.reason)}</div>
                  </div>
                </div>

                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-5 mt-5 border-t'>
                  <div className='text-xs text-muted-foreground font-medium break-words'>
                    Người gửi: {dispute.raisedById?.displayName || dispute.raisedById?.email || 'Thành viên'} ({dispute.raisedById?.email})
                  </div>
                  <Button onClick={() => setSelectedDispute(dispute)} variant='outline' className='rounded-md text-xs font-semibold'>
                    Xem chi tiết đối chất
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Detail Dialog */}
      <DisputeDetailDialog
        dispute={selectedDispute}
        onClose={() => setSelectedDispute(null)}
        onRefresh={fetchMyDisputes}
      />
    </div>
  )
}
