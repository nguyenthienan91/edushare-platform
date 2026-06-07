import { useState, useEffect, useCallback } from 'react'
import {
  History,
  XCircle,
  ShieldCheck,
  Loader2,
  Clock,
  User
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
// Avatar import removed as unused
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { fetchClient } from '@/utils/fetchClient'
import { toast } from 'sonner'

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [resolving, setResolving] = useState(false)

  const fetchDisputes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchClient('/admin/disputes?page=1&itemPerPage=50')
      if (res && res.status === 'success') {
        const list = res.list || res.data || []
        setDisputes(list)
        if (list.length > 0 && !selectedId) {
          setSelectedId(list[0]._id)
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh sách khiếu nại.')
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  useEffect(() => {
    fetchDisputes()
  }, [fetchDisputes])

  const handleResolve = async (id: string, resolution: 'refund' | 'payout') => {
    setResolving(true)
    try {
      const res = await fetchClient(`/admin/disputes/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolution })
      })
      if (res && res.status === 'success') {
        toast.success(res.message || 'Phân xử khiếu nại thành công!')
        await fetchDisputes()
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xử lý khiếu nại.')
    } finally {
      setResolving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700'
      case 'resolved_refund':
        return 'bg-emerald-100 text-emerald-700'
      case 'resolved_payout':
        return 'bg-indigo-100 text-indigo-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý'
      case 'resolved_refund':
        return 'Đã hoàn tiền'
      case 'resolved_payout':
        return 'Đã giải ngân'
      default:
        return status
    }
  }

  const getReason = (reason: string) => {
    const map: Record<string, string> = {
      access_denied: 'Chưa được thêm vào nhóm',
      service_disruption: 'Dịch vụ bị gián đoạn / bị kick',
      incorrect_plan: 'Gói không đúng mô tả',
      payment_issue: 'Lỗi thanh toán / giải ngân',
      account_removed: 'Tài khoản bị gỡ khỏi nhóm',
    }
    return map[reason] || reason
  }

  const currentDispute = disputes.find((d) => d._id === selectedId) || disputes[0] || null

  return (
    <div className='space-y-6 min-h-[calc(100vh-80px)]'>
      <Card>
        <CardContent>
          <Badge className='rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-100'>Trung tâm hòa giải</Badge>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight'>Quản lý Khiếu nại</h2>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-500'>
            Xử lý tranh chấp giữa các thành viên bằng góc nhìn khách quan. Đảm bảo an toàn giao dịch qua hệ thống ký quỹ.
          </p>
        </CardContent>
      </Card>

      {loading && disputes.length === 0 ? (
        <div className='flex justify-center items-center py-20'>
          <Loader2 className='w-8 h-8 animate-spin text-slate-400' />
        </div>
      ) : disputes.length === 0 ? (
        <div className='border border-slate-200 rounded-2xl p-12 text-center bg-card shadow-sm'>
          <Clock className='w-12 h-12 mx-auto mb-3 text-slate-300' />
          <h3 className='text-lg font-semibold '>Không có khiếu nại nào</h3>
          <p className='text-sm text-slate-400 mt-1'>Hệ thống hiện tại sạch bóng các khiếu nại tranh chấp.</p>
        </div>
      ) : (
        <div className='grid gap-6 lg:grid-cols-[380px_1fr] items-start'>
          {/* Left Column: List of Disputes */}
          <Card>
            <CardHeader className='py-5 px-6 border-b border-slate-100 bg-slate-50/50'>
              <CardTitle className='text-lg flex items-center gap-2'>
                <History className='w-5 h-5 text-indigo-500' /> Danh sách khiếu nại
              </CardTitle>
            </CardHeader>
            <ScrollArea className='h-[300px] lg:h-[650px] overflow-y-auto'>
              <div className='p-3 space-y-2'>
                {disputes.map((dispute) => (
                  <button
                    key={dispute._id}
                    onClick={() => setSelectedId(dispute._id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all border ${
                      selectedId === dispute._id
                        ? 'bg-indigo-50/50 border-indigo-200 shadow-sm'
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className='flex items-start justify-between mb-2'>
                      <Badge
                        variant='outline'
                        className={`text-[10px] rounded-lg px-2 border-none ${getStatusBadge(dispute.status)}`}
                      >
                        {getStatusLabel(dispute.status)}
                      </Badge>
                      <span className='text-[10px] text-slate-400 font-medium'>
                        {new Date(dispute.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <h4 className='font-semibold text-sm leading-snug mb-1 text-slate-900 dark:text-slate-100'>
                      {getReason(dispute.reason)}
                    </h4>
                    <p className='text-xs text-slate-400 mb-2 truncate'>
                      Mã: {dispute._id.substring(dispute._id.length - 8).toUpperCase()}
                    </p>
                    <div className='flex items-center gap-2 text-xs text-slate-500'>
                      <User className='w-3 h-3' />
                      <span className='truncate'>
                        {dispute.raisedById?.displayName || dispute.raisedById?.name || dispute.raisedById?.email || 'N/A'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Right Column: Dispute Detail & Action */}
          {currentDispute && (
            <div className='flex flex-col gap-6'>
              <Card>
                {/* Header Detail */}
                <div className='p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/30'>
                  <div>
                    <div className='flex items-center gap-2 mb-2'>
                      <Badge
                        variant='secondary'
                        className={`text-xs rounded-lg border-none ${getStatusBadge(currentDispute.status)}`}
                      >
                        {getStatusLabel(currentDispute.status)}
                      </Badge>
                      <span className='text-sm font-semibold text-slate-700'>
                        Mã đơn: #{currentDispute._id.toUpperCase()}
                      </span>
                    </div>
                    <h3 className='text-xl font-bold text-slate-950 dark:text-slate-50'>
                      Lý do: {getReason(currentDispute.reason)}
                    </h3>
                  </div>

                  <div className='flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 shadow-sm'>
                    <div className='text-right'>
                      <div className='text-xs text-slate-400'>Số tiền bị đóng băng</div>
                      <div className='text-xl font-bold text-rose-600'>
                        {(currentDispute.transactionId?.amount || 0).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className='p-6 space-y-6'>
                  {/* Symmetrical split view for evidence and statements */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Left: Member Card */}
                    <Card className='rounded-2xl border-slate-200 shadow-sm'>
                      <CardHeader className='pb-3 border-b border-slate-50 bg-slate-50/50 p-4'>
                        <CardTitle className='text-sm font-semibold text-rose-700 flex items-center gap-2'>
                          <span className='flex size-6 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-xs font-bold'>1</span>
                          Khiếu nại từ Member
                        </CardTitle>
                        <CardDescription className='text-xs font-medium text-slate-500'>
                          Tên: {currentDispute.raisedById?.displayName || currentDispute.raisedById?.name || 'N/A'} ({currentDispute.raisedById?.email || 'N/A'})
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='p-4 space-y-4'>
                        <div>
                          <h4 className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>Lý do & mô tả khiếu nại</h4>
                          <p className='text-sm font-semibold text-slate-800 dark:text-slate-200'>{getReason(currentDispute.reason)}</p>
                        </div>
                        <div>
                          <h4 className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2'>Ảnh bằng chứng thành viên gửi</h4>
                          {currentDispute.memberEvidence && currentDispute.memberEvidence.length > 0 ? (
                            <div className='flex flex-col items-center gap-3 w-full'>
                              {currentDispute.memberEvidence.map((src: string, i: number) => (
                                <a
                                  href={src}
                                  target='_blank'
                                  rel='noreferrer'
                                  key={i}
                                  className='relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 block bg-slate-50 group hover:shadow-md transition-all'
                                >
                                  <img
                                    src={src}
                                    alt='Member Evidence'
                                    className='h-full w-full object-cover group-hover:scale-105 transition-transform duration-300'
                                  />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <p className='text-xs text-slate-400 italic font-medium'>Không đính kèm ảnh.</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Right: Owner Card */}
                    <Card className='rounded-2xl border-slate-200 shadow-sm'>
                      <CardHeader className='pb-3 border-b border-slate-50 bg-slate-50/50 p-4'>
                        <CardTitle className='text-sm font-semibold text-indigo-700 flex items-center gap-2'>
                          <span className='flex size-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold'>2</span>
                          Đối chất từ Chủ nhóm
                        </CardTitle>
                        <CardDescription className='text-xs font-medium text-slate-500'>
                          Mã nhóm liên quan: {currentDispute.transactionId?.groupId || 'N/A'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='p-4 space-y-4'>
                        <div>
                          <h4 className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>Mã giao dịch ký quỹ</h4>
                          <p className='text-sm font-semibold text-slate-800 dark:text-slate-200 truncate'>{currentDispute.transactionId?._id || 'N/A'}</p>
                        </div>
                        <div>
                          <h4 className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2'>Ảnh đối chất chủ nhóm gửi</h4>
                          {currentDispute.ownerEvidence && currentDispute.ownerEvidence.length > 0 ? (
                            <div className='flex flex-col items-center gap-3 w-full'>
                              {currentDispute.ownerEvidence.map((src: string, i: number) => (
                                <a
                                  href={src}
                                  target='_blank'
                                  rel='noreferrer'
                                  key={i}
                                  className='relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 block bg-slate-50 group hover:shadow-md transition-all'
                                >
                                  <img
                                    src={src}
                                    alt='Owner Evidence'
                                    className='h-full w-full object-cover group-hover:scale-105 transition-transform duration-300'
                                  />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <p className='text-xs text-slate-400 italic font-medium'>Chủ nhóm chưa cung cấp bằng chứng.</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator className='bg-slate-100' />

                  {/* Resolution Info */}
                  {currentDispute.status !== 'pending' && (
                    <div className='bg-slate-50 dark:bg-slate-800/30 border rounded-2xl p-4 text-sm text-slate-600 dark:text-slate-400'>
                      <p className='font-semibold text-slate-800 dark:text-slate-100 mb-1'>Phán quyết của Admin</p>
                      {currentDispute.status === 'resolved_refund' 
                        ? 'Đã xử Member thắng: Hệ thống đã hoàn lại 100% số tiền cọc cho Member và hủy giao dịch này.'
                        : 'Đã xử Chủ nhóm thắng: Giao dịch đã được giải ngân thành công cho Chủ nhóm.'}
                    </div>
                  )}

                  {/* Resolution Actions */}
                  {currentDispute.status === 'pending' && (
                    <div className='pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3'>
                      <Button
                        variant='outline'
                        onClick={() => handleResolve(currentDispute._id, 'payout')}
                        className='text-indigo-700 border-indigo-200 hover:bg-indigo-50 rounded-xl'
                        disabled={resolving}
                      >
                        {resolving ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : <ShieldCheck className='w-4 h-4 mr-2' />}
                        Giải ngân cho Owner (Chủ nhóm thắng)
                      </Button>
                      <Button
                        onClick={() => handleResolve(currentDispute._id, 'refund')}
                        className='bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm'
                        disabled={resolving}
                      >
                        {resolving ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : <XCircle className='w-4 h-4 mr-2' />}
                        Hoàn tiền cho Member (Member thắng)
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
