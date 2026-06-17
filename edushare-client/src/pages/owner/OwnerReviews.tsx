import { DashboardLayout } from '@/components/dashboard-layout'

export default function OwnerReviews() {
  return (
    <DashboardLayout
      role="owner"
      title="Đánh giá"
      description="Trang đánh giá được giữ theo layout dashboard của Owner."
    >
      <div className="rounded-2xl border  p-6 shadow-sm">
        <h1 className="text-2xl font-semibold ">Đánh giá</h1>
        <p className="mt-2 ">Trang này sẽ được xây dựng tiếp theo flow mới.</p>
      </div>
    </DashboardLayout>
  )
}
