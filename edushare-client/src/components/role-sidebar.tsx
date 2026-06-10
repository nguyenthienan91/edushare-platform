import {
  type LucideIcon,
  Users,
  Group,
  AlertCircle,
  Banknote,
  Gauge,
  FolderPlus,
  Upload,
  Wallet,
  Home,
  CreditCard,
  UserPlus,
  Star,
  ShieldAlert,
  Settings,
  RefreshCw,
} from 'lucide-react'
import { SidebarSeparator } from '@/components/ui/sidebar'
import { NavUser } from '@/components/nav-user'
import { NavMain } from '@/components/nav-main'

export type DashboardRole = 'admin' | 'owner' | 'member'

type SidebarLink = {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: { title: string; url: string }[]
}

const roleMenus: Record<DashboardRole, { sections: { label: string; items: SidebarLink[] }[] }> = {
  admin: {
    sections: [
      {
        label: 'Khám phá',
        items: [{ title: 'Tổng quan Admin', url: '/admin/overview', icon: Home, isActive: true }],
      },
      {
        label: 'Quản trị',
        items: [
          { title: 'Quản lý người dùng', url: '/admin/users', icon: Users },
          { title: 'Quản lý nhóm', url: '/admin/groups', icon: Group },
          { title: 'Quản lý tranh chấp', url: '/admin/disputes', icon: AlertCircle },
          { title: 'Phê duyệt rút tiền', url: '/admin/withdrawals', icon: Banknote },
          { title: 'Thống kê doanh thu', url: '/admin/revenue', icon: Gauge },
        ],
      },
    ],
  },
  owner: {
    sections: [
      {
        label: 'Khám phá',
        items: [{ title: 'Tổng quan Owner', url: '/owner/overview', icon: Home, isActive: true }],
      },
      {
        label: 'Quản lý',
        items: [
          { title: 'Tạo nhóm', url: '/owner/groups/create', icon: FolderPlus },
          { title: 'Quản lý nhóm', url: '/owner/groups', icon: Group },
          { title: 'Tải bằng chứng', url: '/owner/evidence', icon: Upload },
          { title: 'Ví ký quỹ', url: '/owner/wallet', icon: Wallet },
          { title: 'Yêu cầu rút tiền', url: '/owner/withdrawals', icon: Banknote },
          { title: 'Nhắc gia hạn', url: '/owner/renewals', icon: RefreshCw },
        ],
      },
    ],
  },
  member: {
    sections: [
      {
        label: 'Khám phá',
        items: [
          { title: 'Tổng quan', url: '/dashboard/overview', icon: Home, isActive: true },
          { title: 'Gia nhập nhóm', url: '/dashboard/participant', icon: UserPlus },
        ],
      },
      {
        label: 'Quản lý',
        items: [
          { title: 'Tạo nhóm', url: '/dashboard/groups/create', icon: FolderPlus },
          { title: 'Quản lý nhóm', url: '/dashboard/groups', icon: Group },
          // { title: 'Tải bằng chứng', url: '/dashboard/evidence', icon: Upload },
          // { title: 'Nhắc gia hạn', url: '/dashboard/renewals', icon: RefreshCw },
        ],
      },
      {
        label: 'Cá nhân',
        items: [
          { title: 'Đơn hàng của tôi', url: '/dashboard/participant/orders', icon: CreditCard },
          { title: 'Ví ký quỹ', url: '/dashboard/wallet', icon: Wallet },
          { title: 'Đánh giá', url: '/dashboard/reviews', icon: Star },
          { title: 'Tranh chấp', url: '/dashboard/disputes', icon: ShieldAlert },
          { title: 'Cài đặt', url: '/dashboard/settings', icon: Settings },
        ],
      },
    ],
  },
}

export function RoleSidebar({ role }: { role: DashboardRole }) {
  const menu = roleMenus[role]

  return (
    <div className='flex h-full flex-col'>
      <div className='p-2'>
        <NavMain sections={menu.sections} />
      </div>
      <div className='mt-auto p-2'>
        <SidebarSeparator />
        <div className='pt-2'>
          <NavUser />
        </div>
      </div>
    </div>
  )
}
