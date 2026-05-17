import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { LogOutIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NavUser() {
  return (
    <SidebarMenu>
     
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link to="/">
            <LogOutIcon className="size-4" />
            <span>Đăng xuất</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
