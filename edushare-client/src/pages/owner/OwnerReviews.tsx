import { DashboardLayout } from '@/components/dashboard-layout'

export default function OwnerReviews() {
  return (
    <DashboardLayout
      role="owner"
      title="Đánh giá"
      description="Trang đánh giá được giữ theo layout dashboard của Owner."
    >
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Đánh giá</h1>
        <p className="mt-2 text-slate-600">Trang này sẽ được xây dựng tiếp theo flow mới.</p>
      </div>
    </DashboardLayout>
  )
}
