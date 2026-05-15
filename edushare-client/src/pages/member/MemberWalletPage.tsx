export default function MemberWalletPage() {
  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {[
        { label: 'Số dư hiện tại', value: '$45.20' },
        { label: 'Đã nạp', value: '$120.00' },
        { label: 'Đã chi', value: '$74.80' }
      ].map((item) => (
        <div key={item.label} className='rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm'>
          <p className='text-sm text-slate-500'>{item.label}</p>
          <p className='mt-2 text-3xl font-semibold text-slate-900'>{item.value}</p>
        </div>
      ))}
    </div>
  )
}
