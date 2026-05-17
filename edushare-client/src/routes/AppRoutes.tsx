import { Navigate, Route, Routes } from 'react-router-dom'

import MainLayout from '@/layouts/MainLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminDisputes from '@/pages/admin/AdminDisputes'
import AdminGroups from '@/pages/admin/AdminGroups'
import AdminRevenue from '@/pages/admin/AdminRevenue'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminWithdrawals from '@/pages/admin/AdminWithdrawals'
import LandingPage from '@/pages/Landingpage'
import LoginPage from '@/pages/auth/LoginPage'
import MemberParticipantPage from '@/pages/member/MemberParticipantPageNew'
import MemberParticipantOrdersPage from '@/pages/member/MemberParticipantOrdersPage'
import MemberWalletPage from '@/pages/member/MemberWalletPage'
import MemberReviewsPage from '@/pages/member/MemberReviewsPage'
import MemberDisputesPage from '@/pages/member/MemberDisputesPage'
import MemberSettingsPage from '@/pages/member/MemberSettingsPage'
import OwnerCreateGroup from '@/pages/owner/OwnerCreateGroup'
import OwnerDashboard from '@/pages/owner/OwnerDashboard'
import OwnerEvidence from '@/pages/owner/OwnerEvidence'
import OwnerManageGroup from '@/pages/owner/OwnerManageGroup'
import OwnerRenewals from '@/pages/owner/OwnerRenewals'
import OwnerWallet from '@/pages/owner/OwnerWallet'
import { DashboardLayout } from '@/components/dashboard-layout'
import type { DashboardRole } from '@/components/role-sidebar'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className='rounded-2xl border bg-white p-6 shadow-sm'>
      <h1 className='text-2xl font-semibold'>{title}</h1>
      <p className='mt-2 text-slate-600'>Trang đang được phát triển.</p>
    </div>
  )
}

function DashboardRoute({
  role,
  title,
  description,
  children
}: {
  role: DashboardRole
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <DashboardLayout role={role} title={title} description={description}>
      {children}
    </DashboardLayout>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path='/' element={<LandingPage />} />
      </Route>

      <Route path='/login' element={<LoginPage />} />
      <Route path='/member' element={<Navigate to='/dashboard/participant' replace />} />
      <Route path='/member/overview' element={<Navigate to='/dashboard/participant' replace />} />
      <Route path='/member/wallet' element={<Navigate to='/dashboard/wallet' replace />} />
      <Route path='/member/groups' element={<Navigate to='/dashboard/participant' replace />} />
      <Route path='/member/renewals' element={<Navigate to='/dashboard/participant' replace />} />
      <Route path='/member/transactions' element={<Navigate to='/dashboard/participant/orders' replace />} />
      <Route path='/dashboard' element={<Navigate to='/dashboard/participant' replace />} />
      <Route
        path='/dashboard/participant'
        element={
          <DashboardRoute role='member' title='Thị trường' description='Khám phá các nhóm và cơ hội tham gia.'>
            <MemberParticipantPage />
          </DashboardRoute>
        }
      />
      <Route
        path='/dashboard/participant/orders'
        element={
          <DashboardRoute role='member' title='Đơn hàng của tôi' description='Theo dõi các đơn hàng gần đây.'>
            <MemberParticipantOrdersPage />
          </DashboardRoute>
        }
      />
      <Route
        path='/dashboard/wallet'
        element={
          <DashboardRoute role='member' title='Ví ký quỹ' description='Quản lý số dư và giao dịch ký quỹ.'>
            <MemberWalletPage />
          </DashboardRoute>
        }
      />
      <Route
        path='/dashboard/reviews'
        element={
          <DashboardRoute role='member' title='Đánh giá' description='Xem lại các đánh giá của bạn.'>
            <MemberReviewsPage />
          </DashboardRoute>
        }
      />
      <Route
        path='/dashboard/disputes'
        element={
          <DashboardRoute role='member' title='Tranh chấp' description='Theo dõi các tranh chấp đang xử lý.'>
            <MemberDisputesPage />
          </DashboardRoute>
        }
      />
      <Route
        path='/dashboard/settings'
        element={
          <DashboardRoute role='member' title='Cài đặt' description='Thiết lập tài khoản và tuỳ chọn cá nhân.'>
            <MemberSettingsPage />
          </DashboardRoute>
        }
      />

      <Route path='/admin' element={<Navigate to='/admin/overview' replace />} />
      <Route
        path='/admin/overview'
        element={
          <DashboardRoute role='admin' title='Tổng quan Admin' description='Tổng quan hệ thống quản trị.'>
            <AdminDashboard />
          </DashboardRoute>
        }
      />
      <Route
        path='/admin/users'
        element={
          <DashboardRoute role='admin' title='Quản lý người dùng' description='Quản lý tài khoản người dùng.'>
            <AdminUsers />
          </DashboardRoute>
        }
      />
      <Route
        path='/admin/groups'
        element={
          <DashboardRoute role='admin' title='Quản lý nhóm' description='Quản lý các nhóm chia sẻ.'>
            <AdminGroups />
          </DashboardRoute>
        }
      />
      <Route
        path='/admin/disputes'
        element={
          <DashboardRoute role='admin' title='Quản lý tranh chấp' description='Xử lý các khiếu nại và tranh chấp.'>
            <AdminDisputes />
          </DashboardRoute>
        }
      />
      <Route
        path='/admin/withdrawals'
        element={
          <DashboardRoute role='admin' title='Phê duyệt rút tiền' description='Duyệt các yêu cầu rút tiền.'>
            <AdminWithdrawals />
          </DashboardRoute>
        }
      />
      <Route
        path='/admin/revenue'
        element={
          <DashboardRoute role='admin' title='Thống kê doanh thu' description='Theo dõi doanh thu hệ thống.'>
            <AdminRevenue />
          </DashboardRoute>
        }
      />

      <Route path='/owner' element={<Navigate to='/owner/overview' replace />} />
      <Route path='/owner/overview' element={<OwnerDashboard />} />
      <Route path='/owner/groups/create' element={<OwnerCreateGroup />} />
      <Route path='/owner/groups' element={<OwnerManageGroup />} />
      <Route
        path='/owner/members'
        element={
          <DashboardRoute role='owner' title='Quản lý thành viên' description='Quản lý thành viên trong nhóm.'>
            <PlaceholderPage title='Quản lý thành viên' />
          </DashboardRoute>
        }
      />
      <Route path='/owner/evidence' element={<OwnerEvidence />} />
      <Route path='/owner/wallet' element={<OwnerWallet />} />
      <Route
        path='/owner/withdrawals'
        element={
          <DashboardRoute role='owner' title='Yêu cầu rút tiền' description='Gửi yêu cầu rút tiền.'>
            <PlaceholderPage title='Yêu cầu rút tiền' />
          </DashboardRoute>
        }
      />
      <Route path='/owner/renewals' element={<OwnerRenewals />} />

      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}
