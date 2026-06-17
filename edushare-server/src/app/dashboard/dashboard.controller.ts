import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { User } from '../../common/decorators/user.decorator'
import type { UserInfo } from '../../common/decorators/user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { AuthGuard } from '../auth/auth.guard'
import { DashboardService } from './dashboard.service'

@ApiTags('Dashboard')
@Controller('dashboard')
@Roles() // Exposes to any authenticated user (roles guard will bypass checks, but AuthGuard will authenticate)
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('member-growth')
  @ApiOperation({ summary: 'Lay bieu do tang truong thanh vien trong tuan' })
  @ApiResponse({ status: 200, description: 'Lay du lieu bieu do thanh cong.' })
  async getMemberGrowth(@User() user: UserInfo) {
    return this.dashboardService.getMemberGrowthChart(user.userID)
  }

  @Get('featured-groups')
  @ApiOperation({ summary: 'Lay danh sach cac nhom noi bat trong tuan' })
  @ApiResponse({ status: 200, description: 'Lay danh sach nhom noi bat thanh cong.' })
  async getFeaturedGroups() {
    return this.dashboardService.getFeaturedGroups()
  }
}
