import { useState } from 'react'
import { AlertCircle, Clock, CheckCircle, UploadCloud, Loader2, CheckCircle2, Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { fetchClient } from '@/utils/fetchClient'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface DisputeDetailDialogProps {
  dispute: any | null
  onClose: () => void
  onRefresh: () => void
}

export function DisputeDetailDialog({ dispute, onClose, onRefresh }: DisputeDetailDialogProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

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
      await onRefresh()
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Nộp bằng chứng phản biện thất bại.')
    } finally {
      setUploading(false)
    }
  }

  if (!dispute) return null

  const status = getStatus(dispute.status)
  const isOwner = user?.userID === dispute.transactionId?.groupId?.ownerId

  return (
    <Dialog open={!!dispute} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='w-[calc(100%-2rem)] sm:max-w-3xl md:max-w-4xl rounded-3xl overflow-hidden p-6 gap-0 max-h-[90vh] flex flex-col'>
        <DialogHeader className='pb-4 border-b shrink-0'>
          <div className='flex flex-wrap items-center gap-2 mb-1.5'>
            <Badge className={`rounded-full border-none font-semibold ${status.color}`}>
              {status.label}
            </Badge>
            <span className='text-xs text-muted-foreground font-medium'>
              Mã đơn khiếu nại: #{dispute._id.toUpperCase()}
            </span>
          </div>
          <DialogTitle className='text-2xl font-bold tracking-tight text-foreground'>
            {dispute.transactionId?.groupId?.name || 'Chi tiết tranh chấp'}
          </DialogTitle>
          <DialogDescription className='text-xs font-medium mt-1'>
            Khởi tạo ngày: {new Date(dispute.createdAt).toLocaleString('vi-VN')}
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto pr-2 mt-4 space-y-6 max-h-[calc(90vh-140px)] scrollbar-thin'>
          {/* Lý do khiếu nại đưa lên trên cùng */}
          <div className='rounded-2xl border border-border/80 p-4 bg-muted/20 flex flex-col gap-1'>
            <h4 className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>Lý do khiếu nại</h4>
            <p className='text-sm font-semibold text-foreground'>{getReason(dispute.reason)}</p>
          </div>

          {/* Symmetrical split view grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Left Side: Member argument & evidence */}
            <Card className='rounded-2xl shadow-sm border border-border/80 flex flex-col justify-between overflow-hidden'>
              <div>
                <CardHeader className='pb-3 border-b bg-muted/30 p-4'>
                  <CardTitle className='text-sm font-semibold text-rose-700 flex items-center gap-2'>
                    <span className='flex size-6 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-xs font-bold'>1</span>
                    Phía Thành viên (Khiếu nại)
                  </CardTitle>
                  <CardDescription className='text-xs font-medium'>
                    Người nộp: {dispute.raisedById?.displayName || dispute.raisedById?.email || 'Thành viên'}
                  </CardDescription>
                </CardHeader>
                <CardContent className='p-4 space-y-4'>
                  <div>
                    <h4 className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2'>Tệp ảnh minh chứng</h4>
                    {dispute.memberEvidence && dispute.memberEvidence.length > 0 ? (
                      <div className='flex flex-col items-center gap-3 w-full'>
                        {dispute.memberEvidence.map((url: string, index: number) => (
                          <a 
                            href={url} 
                            target='_blank' 
                            rel='noreferrer' 
                            key={index} 
                            className='relative w-full aspect-video rounded-xl overflow-hidden border border-border/60 block bg-muted/20 group hover:shadow-md hover:border-primary/20 transition-all duration-300'
                          >
                            <img 
                              src={url} 
                              alt='Member evidence' 
                              className='h-full w-full object-cover group-hover:scale-105 transition-transform duration-300' 
                            />
                            <div className='absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300'>
                              <span className='text-white text-[10px] font-bold px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm flex items-center gap-1 scale-90 group-hover:scale-100 transition-transform duration-300'>
                                <Eye className='w-3 h-3' /> Xem ảnh lớn
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className='flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/10 text-center w-full'>
                        <AlertCircle className='w-5 h-5 text-muted-foreground/40 mb-1.5' />
                        <p className='text-xs text-muted-foreground italic font-medium'>Thành viên không đính kèm hình ảnh.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Right Side: Owner argument & counter-evidence */}
            <Card className='rounded-2xl shadow-sm border border-border/80 flex flex-col justify-between overflow-hidden'>
              <div>
                <CardHeader className='pb-3 border-b bg-muted/30 p-4'>
                  <CardTitle className='text-sm font-semibold text-indigo-700 flex items-center gap-2'>
                    <span className='flex size-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold'>2</span>
                    Phía Chủ nhóm (Đối chất)
                  </CardTitle>
                  <CardDescription className='text-xs font-medium'>
                    Bằng chứng hoặc yêu cầu nộp phản biện
                  </CardDescription>
                </CardHeader>
                <CardContent className='p-4 space-y-4'>
                  {isOwner && dispute.status === 'pending' ? (
                    <div className='space-y-3'>
                      <p className='text-xs text-muted-foreground leading-normal font-medium'>
                        Hãy tải lên ảnh chụp màn hình chứng minh bạn đã cấp quyền sử dụng dịch vụ cho member này để đối chất thành công.
                      </p>
                      <div className='flex flex-col gap-2'>
                        <input
                          type='file'
                          multiple
                          accept='image/*'
                          id={`file-upload-dialog-${dispute._id}`}
                          className='hidden'
                          onChange={(e) => setSelectedFiles(e.target.files)}
                        />
                        <Button 
                          variant='outline' 
                          size='sm'
                          onClick={() => document.getElementById(`file-upload-dialog-${dispute._id}`)?.click()}
                          className='rounded-xl w-full text-xs font-semibold h-9'
                          disabled={uploading}
                        >
                          <UploadCloud className='w-4 h-4 mr-2 text-muted-foreground' />
                          Chọn hình ảnh tệp tin
                        </Button>
                        <Button 
                          size='sm'
                          onClick={() => handleCounterProofSubmit(dispute._id)}
                          className='bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl w-full text-xs font-semibold h-9 transition-colors'
                          disabled={uploading || !selectedFiles}
                        >
                          {uploading ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : <CheckCircle2 className='w-4 h-4 mr-2' />}
                          Gửi ảnh đối chất phản biện
                        </Button>
                      </div>
                      {selectedFiles && selectedFiles.length > 0 && (
                        <p className='text-xs text-indigo-600 font-semibold text-center mt-1'>
                          Đã chọn {selectedFiles.length} ảnh
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h4 className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2'>Ảnh phản biện từ chủ nhóm</h4>
                      {dispute.ownerEvidence && dispute.ownerEvidence.length > 0 ? (
                        <div className='flex flex-col items-center gap-3 w-full'>
                          {dispute.ownerEvidence.map((url: string, index: number) => (
                            <a 
                              href={url} 
                              target='_blank' 
                              rel='noreferrer' 
                              key={index} 
                              className='relative w-full aspect-video rounded-xl overflow-hidden border border-border/60 block bg-muted/20 group hover:shadow-md hover:border-primary/20 transition-all duration-300'
                            >
                              <img 
                                src={url} 
                                alt='Owner evidence' 
                                className='h-full w-full object-cover group-hover:scale-105 transition-transform duration-300' 
                              />
                              <div className='absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300'>
                                <span className='text-white text-[10px] font-bold px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm flex items-center gap-1 scale-90 group-hover:scale-100 transition-transform duration-300'>
                                  <Eye className='w-3 h-3' /> Xem ảnh lớn
                                </span>
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className='flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/10 text-center w-full'>
                          <AlertCircle className='w-5 h-5 text-muted-foreground/40 mb-1.5' />
                          <p className='text-xs text-muted-foreground italic font-medium'>Chủ nhóm chưa gửi bất kỳ ảnh đối chất nào.</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>
          </div>

          <Separator />

          {/* Bottom Resolution summary */}
          <div className='rounded-2xl border p-4 bg-muted/30 flex flex-col md:flex-row md:items-center justify-between gap-4'>
            <div className='space-y-0.5 shrink-0'>
              <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>Tổng giá trị cọc đóng băng</p>
              <p className='text-2xl font-black text-rose-600'>{(dispute.transactionId?.amount || 0).toLocaleString('vi-VN')} ₫</p>
            </div>
            <div className='text-xs font-semibold leading-relaxed text-muted-foreground max-w-lg'>
              {dispute.status === 'pending' ? (
                <span className='text-amber-600 flex items-center gap-2'>
                  <AlertCircle className='w-4 h-4 shrink-0 text-amber-500' />
                  Hồ sơ tranh chấp đang được đóng băng an toàn và đợi Admin đưa ra phán quyết hoàn trả hoặc giải ngân.
                </span>
              ) : (
                <div className='flex gap-2 items-start'>
                  <CheckCircle className='w-4 h-4 text-emerald-600 shrink-0 mt-0.5' />
                  <div>
                    <span className='font-bold text-foreground'>Phán quyết từ Admin: </span>
                    <span className='text-muted-foreground'>
                      {dispute.status === 'resolved_refund'
                        ? 'Admin phán quyết Member thắng kiện: Số tiền giao dịch đã được hoàn trả về ví của Member.'
                        : 'Admin phán quyết Chủ nhóm thắng kiện: Số tiền giao dịch đã được giải ngân cho Chủ nhóm.'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
