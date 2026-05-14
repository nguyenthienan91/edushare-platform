
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/Landingpage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminGroups from './pages/admin/AdminGroups'
import AdminDisputes from './pages/admin/AdminDisputes'
import AdminWithdrawals from './pages/admin/AdminWithdrawals'
import AdminRevenue from './pages/admin/AdminRevenue'
import OwnerDashboard from './pages/owner/OwnerDashboard'
import OwnerWallet from './pages/owner/OwnerWallet'
import OwnerManageGroup from './pages/owner/OwnerManageGroup'
import OwnerCreateGroup from './pages/owner/OwnerCreateGroup'
import OwnerEvidence from './pages/owner/OwnerEvidence'
import OwnerRenewals from './pages/owner/OwnerRenewals'
import { DashboardLayout } from './components/dashboard-layout'
import type { DashboardRole } from './components/role-sidebar'

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

export default function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path='/' element={<LandingPage />} />

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
    </BrowserRouter>
  )
}
