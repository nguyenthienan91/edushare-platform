import { useState, useEffect, useCallback } from 'react'
import { AlertCircle, CheckCircle, Clock, FileText, Loader2, UploadCloud, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { fetchClient } from '@/utils/fetchClient'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function MemberDisputesPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<string>('all')
  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null)
  
  // Counter proof upload states
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

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

  const handleCounterProofSubmit = async (disputeId: string) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ảnh bằng chứng đối chất.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      Array.from(selectedFiles).forEach((file) => {
        formData.append('files', file)
      })

      await fetchClient(`/disputes/${disputeId}/counter-proof`, {
        method: 'PATCH',
        body: formData,
      })

      toast.success('Nộp bằng chứng phản biện thành công!')
      setSelectedFiles(null)
      await fetchMyDisputes()
      setSelectedDispute(null)
    } catch (err: any) {
      toast.error(err.message || 'Nộp bằng chứng phản biện thất bại.')
    } finally {
      setUploading(false)
    }
  }

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
        return { label: 'Đang chờ', color: 'bg-amber-100 text-amber-700', icon: Clock }
      case 'resolved_refund':
        return { label: 'Đã hoàn tiền (Member thắng)', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle }
      case 'resolved_payout':
        return { label: 'Đã giải ngân (Owner thắng)', color: 'bg-indigo-100 text-indigo-700', icon: CheckCircle }
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
            <div key={item.label} className='border rounded-2xl p-5 shadow-sm bg-card'>
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
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
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
          <div className='border rounded-2xl p-12 text-center bg-card shadow-sm'>
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
              <div key={dispute._id} className='border rounded-2xl p-6 shadow-sm bg-card hover:shadow-md transition duration-200'>
                <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5'>
                  <div>
                    <div className='flex flex-wrap items-center gap-3 mb-2'>
                      <h3 className='text-lg font-bold truncate max-w-full'>{dispute.transactionId?.groupId?.name || 'Nhóm dùng chung'}</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${status.color}`}>
                        <Icon className='w-3 h-3' />
                        {status.label}
                      </div>
                      {isOwner && (
                        <Badge className='bg-indigo-50 text-indigo-700 border-none rounded-full px-2.5 py-0.5 text-xs font-medium'>Chủ nhóm</Badge>
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
                  <Button onClick={() => setSelectedDispute(dispute)} variant='outline' className='rounded-xl text-xs font-semibold'>
                    Xem chi tiết đối chất
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Symmetrical Dialog details */}
      <Dialog open={!!selectedDispute} onOpenChange={(open) => !open && setSelectedDispute(null)}>
        <DialogContent className='w-[calc(100%-2rem)] sm:max-w-3xl md:max-w-4xl rounded-3xl overflow-hidden p-6 gap-0 max-h-[90vh] flex flex-col'>
          <DialogHeader className='pb-4 border-b shrink-0'>
            <div className='flex items-center gap-2 mb-1.5'>
              {selectedDispute && (
                <>
                  <Badge className={`rounded-full border-none font-semibold ${getStatus(selectedDispute.status).color}`}>
                    {getStatus(selectedDispute.status).label}
                  </Badge>
                  <span className='text-xs text-muted-foreground font-medium'>
                    Mã đơn khiếu nại: #{selectedDispute._id.toUpperCase()}
                  </span>
                </>
              )}
            </div>
            <DialogTitle className='text-2xl font-bold tracking-tight'>
              {selectedDispute?.transactionId?.groupId?.name || 'Chi tiết tranh chấp'}
            </DialogTitle>
            <DialogDescription className='text-xs font-medium'>
              Khởi tạo ngày: {selectedDispute && new Date(selectedDispute.createdAt).toLocaleString('vi-VN')}
            </DialogDescription>
          </DialogHeader>

          {selectedDispute && (
            <div className='flex-1 overflow-y-auto pr-2 mt-4 space-y-6 max-h-[calc(90vh-140px)]'>
              {/* Symmetrical split view grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Left Side: Member argument & evidence */}
                <Card className='rounded-2xl shadow-sm'>
                  <CardHeader className='pb-3 border-b bg-muted/50 p-4'>
                    <CardTitle className='text-sm font-semibold text-rose-700 flex items-center gap-2'>
                      <span className='flex size-6 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-xs font-bold'>1</span>
                      Phía Thành viên (Khiếu nại)
                    </CardTitle>
                    <CardDescription className='text-xs font-medium'>
                      Người nộp: {selectedDispute.raisedById?.displayName || 'Thành viên'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='p-4 space-y-4'>
                    <div>
                      <h4 className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1'>Lý do ghi nhận</h4>
                      <p className='text-sm font-semibold'>{getReason(selectedDispute.reason)}</p>
                    </div>
                    <div>
                      <h4 className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2'>Tệp ảnh minh chứng</h4>
                      {selectedDispute.memberEvidence && selectedDispute.memberEvidence.length > 0 ? (
                        <div className='grid grid-cols-2 gap-2'>
                          {selectedDispute.memberEvidence.map((url: string, index: number) => (
                            <a href={url} target='_blank' rel='noreferrer' key={index} className='relative rounded-xl overflow-hidden border block bg-muted'>
                              <img src={url} alt='Member evidence large' className='h-24 w-full object-cover hover:scale-105 transition-transform duration-250' />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className='text-xs text-muted-foreground italic'>Thành viên không đính kèm hình ảnh.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Right Side: Owner argument & counter-evidence */}
                <Card className='rounded-2xl shadow-sm'>
                  <CardHeader className='pb-3 border-b bg-muted/50 p-4'>
                    <CardTitle className='text-sm font-semibold text-indigo-700 flex items-center gap-2'>
                      <span className='flex size-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold'>2</span>
                      Phía Chủ nhóm (Đối chất)
                    </CardTitle>
                    <CardDescription className='text-xs font-medium'>
                      Yêu cầu phản biện bằng hình ảnh cấp quyền
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='p-4 space-y-4'>
                    {user?.userID === selectedDispute.transactionId?.groupId?.ownerId && selectedDispute.status === 'pending' ? (
                      <div className='space-y-3'>
                        <p className='text-xs text-muted-foreground leading-normal font-medium'>
                          Hãy tải lên ảnh chụp màn hình chứng minh bạn đã cấp quyền sử dụng cho member này để giữ an toàn cho số tiền cọc.
                        </p>
                        <div className='flex flex-col gap-2'>
                          <input
                            type='file'
                            multiple
                            accept='image/*'
                            id={`file-upload-dialog-${selectedDispute._id}`}
                            className='hidden'
                            onChange={(e) => setSelectedFiles(e.target.files)}
                          />
                          <Button 
                            variant='outline' 
                            size='sm'
                            onClick={() => document.getElementById(`file-upload-dialog-${selectedDispute._id}`)?.click()}
                            className='rounded-xl w-full text-xs font-semibold'
                            disabled={uploading}
                          >
                            <UploadCloud className='w-4 h-4 mr-2' />
                            Chọn hình ảnh tệp tin
                          </Button>
                          <Button 
                            size='sm'
                            onClick={() => handleCounterProofSubmit(selectedDispute._id)}
                            className='bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl w-full text-xs font-semibold'
                            disabled={uploading || !selectedFiles}
                          >
                            {uploading ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : <CheckCircle2 className='w-4 h-4 mr-2' />}
                            Gửi ảnh đối chất phản biện
                          </Button>
                        </div>
                        {selectedFiles && selectedFiles.length > 0 && (
                          <p className='text-xs text-indigo-600 font-semibold'>Đã chọn {selectedFiles.length} ảnh</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <h4 className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2'>Ảnh phản biện từ chủ nhóm</h4>
                        {selectedDispute.ownerEvidence && selectedDispute.ownerEvidence.length > 0 ? (
                          <div className='grid grid-cols-2 gap-2'>
                            {selectedDispute.ownerEvidence.map((url: string, index: number) => (
                              <a href={url} target='_blank' rel='noreferrer' key={index} className='relative rounded-xl overflow-hidden border block bg-muted'>
                                <img src={url} alt='Owner evidence large' className='h-24 w-full object-cover hover:scale-105 transition-transform duration-250' />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className='text-xs text-muted-foreground italic font-medium'>Chủ nhóm chưa gửi bất kỳ ảnh đối chất nào.</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Bottom Resolution summary */}
              <div className='rounded-2xl border p-4 bg-muted/50 flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <div className='space-y-0.5 shrink-0'>
                  <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>Tổng giá trị cọc đóng băng</p>
                  <p className='text-2xl font-black text-rose-600'>{(selectedDispute.transactionId?.amount || 0).toLocaleString('vi-VN')} ₫</p>
                </div>
                <div className='text-xs font-semibold leading-relaxed text-muted-foreground max-w-lg'>
                  {selectedDispute.status === 'pending' ? (
                    <span className='text-amber-600 flex items-center gap-1.5'>
                      <AlertCircle className='w-4 h-4 shrink-0' />
                      Hồ sơ tranh chấp đang được đóng băng an toàn và đợi Admin đưa ra phán quyết hoàn trả hoặc giải ngân.
                    </span>
                  ) : (
                    <div className='flex gap-2 items-start'>
                      <CheckCircle className='w-4 h-4 text-emerald-600 shrink-0 mt-0.5' />
                      <div>
                        <span className='font-bold'>Phán quyết từ Admin: </span>
                        <span>
                          {selectedDispute.status === 'resolved_refund'
                            ? 'Admin phán quyết Member thắng kiện: Số tiền giao dịch đã được hoàn trả về ví của Member.'
                            : 'Admin phán quyết Chủ nhóm thắng kiện: Số tiền giao dịch đã được giải ngân cho Chủ nhóm.'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
