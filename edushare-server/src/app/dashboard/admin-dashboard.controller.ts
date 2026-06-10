import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
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

  @Get('revenue-summary')
  @ApiOperation({ summary: '[ADMIN] Tong hop doanh thu thang nay vs thang truoc (3 the summary)' })
  @ApiResponse({ status: 200, description: 'Lay tong hop doanh thu thanh cong.' })
  async getRevenueSummary() {
    return this.dashboardService.getAdminRevenueSummary()
  }

  @Get('chart/community-health')
  @ApiOperation({ summary: '[ADMIN] Bieu do so user moi dang ky theo thoi gian' })
  @ApiQuery({
    name: 'period',
    enum: ['day', 'week', 'month', 'year'],
    required: false,
    description: 'Khoang thoi gian nhom du lieu (mac dinh: day)',
  })
  @ApiQuery({ name: 'from', required: false, description: 'Ngay bat dau (ISO 8601)' })
  @ApiQuery({ name: 'to', required: false, description: 'Ngay ket thuc (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Lay du lieu bieu do community health thanh cong.' })
  async getCommunityHealthChart(
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'day',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.dashboardService.getAdminCommunityHealthChart(
      period,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    )
  }

  @Get('chart/revenue')
  @ApiOperation({ summary: '[ADMIN] Bieu do doanh thu (topup + VIP) theo thoi gian' })
  @ApiQuery({
    name: 'period',
    enum: ['day', 'week', 'month', 'year'],
    required: false,
    description: 'Khoang thoi gian nhom du lieu (mac dinh: month)',
  })
  @ApiQuery({ name: 'from', required: false, description: 'Ngay bat dau (ISO 8601)' })
  @ApiQuery({ name: 'to', required: false, description: 'Ngay ket thuc (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Lay du lieu bieu do doanh thu thanh cong.' })
  async getRevenueChart(
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'month',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.dashboardService.getAdminRevenueChart(
      period,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    )
  }

  @Get('chart/groups')
  @ApiOperation({ summary: '[ADMIN] Bieu do so nhom moi duoc tao theo thoi gian' })
  @ApiQuery({
    name: 'period',
    enum: ['day', 'week', 'month', 'year'],
    required: false,
    description: 'Khoang thoi gian nhom du lieu (mac dinh: month)',
  })
  @ApiQuery({ name: 'from', required: false, description: 'Ngay bat dau (ISO 8601)' })
  @ApiQuery({ name: 'to', required: false, description: 'Ngay ket thuc (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Lay du lieu bieu do nhom moi thanh cong.' })
  async getGroupChart(
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'month',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.dashboardService.getAdminGroupChart(
      period,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    )
  }
}
