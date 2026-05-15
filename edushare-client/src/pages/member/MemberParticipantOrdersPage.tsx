export default function MemberParticipantOrdersPage() {
  return (
    <div className='rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm'>
      <div className='space-y-3'>
        {['Đơn #A1023 - Chờ xác nhận', 'Đơn #A1021 - Đã thanh toán', 'Đơn #A1018 - Đang hoàn tất'].map((item) => (
          <div key={item} className='rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700'>
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
