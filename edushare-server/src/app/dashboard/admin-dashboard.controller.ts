import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Roles } from '../../common/decorators/roles.decorator'
import { AuthGuard } from '../auth/auth.guard'
import { UserRole } from '../users/entities/user.entity'
import { DashboardService } from './dashboard.service'

@ApiTags('Admin - Dashboard')
@Controller('admin/dashboard')
@Roles(UserRole.ADMIN)
@UseGuards(AuthGuard)
export class AdminDashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: '[ADMIN] Thong ke doanh thu VIP va chi so he thong' })
  @ApiResponse({ status: 200, description: 'Lay thong ke thanh cong.' })
  async getStats() {
    return this.dashboardService.getAdminDashboardStats()
  }
}
