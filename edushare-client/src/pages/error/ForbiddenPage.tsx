import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-sm">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">403</h1>
        <h2 className="mt-4 text-xl font-bold text-slate-800">Không có quyền truy cập</h2>
        <p className="mt-2 text-sm text-slate-500">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên hoặc quay về trang chủ.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-[14px] bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}
