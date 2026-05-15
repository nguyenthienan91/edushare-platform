export default function MemberDisputesPage() {
  return (
    <div className='rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm'>
      <div className='space-y-3'>
        {['Tranh chấp #D1002 - Đang xử lý', 'Tranh chấp #D1001 - Chờ phản hồi'].map((item) => (
          <div key={item} className='rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700'>
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
