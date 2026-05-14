import { Routes, Route } from 'react-router-dom'

import MainLayout from '@/layouts/MainLayout'
import AdminHomePage from '@/pages/admin/AdminHomePage'
import LandingPage from '@/pages/Landingpage'
import LoginPage from '@/pages/auth/LoginPage'
import MemberHomePage from '@/pages/member/MemberHomePage'
import OwnerHomePage from '@/pages/owner/OwnerHomePage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Main layout */}
      <Route element={<MainLayout />}>
        <Route path='/' element={<LandingPage />} />
      </Route>
      <Route path='/admin' element={<AdminHomePage />} />
      <Route path='/member' element={<MemberHomePage />} />
      <Route path='/owner' element={<OwnerHomePage />} />
      <Route path='/login' element={<LoginPage />} />
    </Routes>
  )
}
