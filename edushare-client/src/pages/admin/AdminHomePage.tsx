export default function AdminHomePage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-50 px-6'>
      <div className='max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center'>
        <p className='text-sm font-semibold uppercase tracking-wider text-emerald-600'>Admin</p>
        <h1 className='mt-3 text-3xl font-bold text-slate-900'>Trang quản trị</h1>
        <p className='mt-4 text-slate-600'>
          Đây là trang đích mẫu cho role `admin`. Sau này bạn có thể thay bằng dashboard thật.
        </p>
      </div>
    </div>
  )
}
