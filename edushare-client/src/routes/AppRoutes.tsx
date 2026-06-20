import { Navigate, Route, Routes, Outlet } from 'react-router-dom'

import MainLayout from '@/layouts/MainLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminDisputes from '@/pages/admin/AdminDisputes'
import AdminGroups from '@/pages/admin/AdminGroups'
import AdminRevenue from '@/pages/admin/AdminRevenue'
import AdminSettings from '@/pages/admin/AdminSettings'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminWithdrawals from '@/pages/admin/AdminWithdrawals'
import LandingPage from '@/pages/Landingpage'
import LoginPage from '@/pages/auth/LoginPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import TopupPage from '@/pages/wallet/TopupPage'
import GroupsPage from '@/pages/GroupsPage'
import MemberJoinGroup from '@/pages/member/MemberJoinGroup'
import MemberGroupDetailPage from '@/pages/member/MemberGroupDetailPage'
import MemberParticipantOrdersPage from '@/pages/member/MemberParticipantOrdersPage'
import MemberWalletPage from '@/pages/member/MemberWalletPage'
import MemberReviewsPage from '@/pages/member/MemberReviewsPage'
import MemberDisputesPage from '@/pages/member/MemberDisputesPage'
import MemberSettingsPage from '@/pages/member/MemberSettingsPage'
import MemberDashboard from '@/pages/member/MemberDashboard'
import MemberCreateGroup from '@/pages/member/MemberCreateGroup'
import MemberManageGroup from '@/pages/member/MemberManageGroup'
import MemberEvidence from '@/pages/member/MemberEvidence'
import MemberRenewals from '@/pages/member/MemberRenewals'
import OwnerCreateGroup from '@/pages/owner/OwnerCreateGroup'
import OwnerDashboard from '@/pages/owner/OwnerDashboard'
import OwnerEvidence from '@/pages/owner/OwnerEvidence'
import OwnerManageGroup from '@/pages/owner/OwnerManageGroup'
import OwnerRenewals from '@/pages/owner/OwnerRenewals'
import OwnerWallet from '@/pages/owner/OwnerWallet'
import { DashboardLayout } from '@/components/dashboard-layout'
import type { DashboardRole } from '@/components/role-sidebar'

import { useAuth } from '@/contexts/AuthContext'
import ForbiddenPage from '@/pages/error/ForbiddenPage'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className='rounded-2xl border  p-6 shadow-sm'>
      <h1 className='text-2xl font-semibold'>{title}</h1>
      <p className='mt-2 '>Trang đang được phát triển.</p>
    </div>
  )
}

function DashboardRoute({
  role,
  title,
  description,
  children,
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

function LoadingScreen() {
  return (
    <div className='flex h-screen w-screen items-center justify-center bg-slate-50/50'>
      <div className='flex flex-col items-center gap-3'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent' />
        <p className='text-sm font-medium text-slate-500'>Đang tải...</p>
      </div>
    </div>
  )
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role?.toLowerCase() !== 'admin') return <ForbiddenPage />
  return <>{children}</>
}

function MemberRoute() {
  const { user, isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role?.toLowerCase() === 'guest') return <ForbiddenPage />
  return <Outlet />
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path='/' element={<LandingPage />} />
        <Route path='/groups' element={<GroupsPage />} />
      </Route>

      <Route
        path='/admin/settings'
        element={
          <AdminRoute>
            <DashboardRoute role='admin' title='Cài đặt tài khoản' description='Quản lý thông tin và bảo mật tài khoản.'>
              <AdminSettings />
            </DashboardRoute>
          </AdminRoute>
        }
      />

      <Route path='/login' element={<LoginPage />} />
      <Route path='/forgot-password' element={<ForgotPasswordPage />} />
      <Route path='/reset-password' element={<ResetPasswordPage />} />
      <Route path='/topup' element={<AuthRoute><TopupPage /></AuthRoute>} />
      <Route element={<MemberRoute />}>
        <Route path='/member' element={<Navigate to='/dashboard/overview' replace />} />
      <Route path='/member/overview' element={<Navigate to='/dashboard/overview' replace />} />
      <Route path='/member/wallet' element={<Navigate to='/dashboard/wallet' replace />} />
      <Route path='/member/groups' element={<Navigate to='/dashboard/groups' replace />} />
      <Route path='/member/renewals' element={<Navigate to='/dashboard/renewals' replace />} />
      <Route path='/member/transactions' element={<Navigate to='/dashboard/participant/orders' replace />} />
      <Route path='/dashboard' element={<Navigate to='/dashboard/overview' replace />} />
      <Route
        path='/dashboard/overview'
        element={
          <DashboardRoute role='member' title='Tổng quan' description='Tổng quan hoạt động của bạn.'>
            <MemberDashboard />
          </DashboardRoute>
        }
      />
      <Route
        path='/dashboard/groups/create'
        element={
          <DashboardRoute role='member' title='Tạo nhóm' description='Tạo nhóm chia sẻ mới.'>
            <MemberCreateGroup />
          </DashboardRoute>
        }
      />
      <Route
        path='/dashboard/groups'
        element={
          <DashboardRoute role='member' title='Quản lý nhóm' description='Quản lý các nhóm của bạn.'>
            <MemberManageGroup />
          </DashboardRoute>
        }
      />
      <Route
        path='/dashboard/evidence'
        element={
          <DashboardRoute role='member' title='Tải bằng chứng' description='Tải lên bằng chứng và tài liệu.'>
            <MemberEvidence />
          </DashboardRoute>
        }
      />
      <Route
        path='/dashboard/renewals'
        element={
          <DashboardRoute role='member' title='Nhắc gia hạn' description='Quản lý các hoạt động gia hạn.'>
            <MemberRenewals />
          </DashboardRoute>
        }
      />
      <Route
        path='/dashboard/participant'
        element={
          <DashboardRoute role='member' title='Gia nhập nhóm' description='Khám phá các nhóm và cơ hội tham gia.'>
            <MemberJoinGroup />
          </DashboardRoute>
        }
      />
      <Route
        path='/dashboard/participant/:id'
        element={
          <DashboardRoute role='member' title='Chi tiết nhóm' description='Xem thông tin chi tiết và đánh giá chủ nhóm.'>
            <MemberGroupDetailPage />
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
      </Route>

      <Route path='/admin' element={<AdminRoute><Navigate to='/admin/overview' replace /></AdminRoute>} />
      <Route
        path='/admin/overview'
        element={
          <AdminRoute>
            <DashboardRoute role='admin' title='Tổng quan Admin' description='Tổng quan hệ thống quản trị.'>
              <AdminDashboard />
            </DashboardRoute>
          </AdminRoute>
        }
      />
      <Route
        path='/admin/users'
        element={
          <AdminRoute>
            <DashboardRoute role='admin' title='Quản lý người dùng' description='Quản lý tài khoản người dùng.'>
              <AdminUsers />
            </DashboardRoute>
          </AdminRoute>
        }
      />
      <Route
        path='/admin/groups'
        element={
          <AdminRoute>
            <DashboardRoute role='admin' title='Quản lý nhóm' description='Quản lý các nhóm chia sẻ.'>
              <AdminGroups />
            </DashboardRoute>
          </AdminRoute>
        }
      />
      <Route
        path='/admin/disputes'
        element={
          <AdminRoute>
            <DashboardRoute role='admin' title='Quản lý tranh chấp' description='Xử lý các khiếu nại và tranh chấp.'>
              <AdminDisputes />
            </DashboardRoute>
          </AdminRoute>
        }
      />
      <Route
        path='/admin/withdrawals'
        element={
          <AdminRoute>
            <DashboardRoute role='admin' title='Phê duyệt rút tiền' description='Duyệt các yêu cầu rút tiền.'>
              <AdminWithdrawals />
            </DashboardRoute>
          </AdminRoute>
        }
      />
      <Route
        path='/admin/revenue'
        element={
          <AdminRoute>
            <DashboardRoute role='admin' title='Thống kê doanh thu' description='Theo dõi doanh thu hệ thống.'>
              <AdminRevenue />
            </DashboardRoute>
          </AdminRoute>
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
