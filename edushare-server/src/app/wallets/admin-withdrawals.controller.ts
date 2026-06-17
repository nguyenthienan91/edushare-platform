import { Body, Controller, Get, Param, Post, Query, UseGuards, UsePipes } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { AuthGuard } from '../auth/auth.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from '../users/entities/user.entity'
import { ParseParamsPaginationPipe } from '../../common/pipes/parse-params-pagination.pipe'
import { Pagination } from '../../common/utils/pagination-util/pagination-util.interface'
import { WalletsService } from './wallets.service'
import { ReviewWithdrawalDto, ReviewWithdrawalSwaggerDto } from './dto/review-withdrawal.dto'

@ApiTags('Admin - Withdrawals')
@Controller('admin/withdrawals')
@Roles(UserRole.ADMIN)
@UseGuards(AuthGuard)
export class AdminWithdrawalsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  @ApiOperation({ summary: '[ADMIN] Lay danh sach tat ca lenh rut tien cua he thong' })
  @ApiQuery({
    name: 'status',
    enum: ['pending', 'approved', 'rejected'],
    required: false,
    description: 'Loc theo trang thai lenh rut tien',
  })
  @ApiQuery({ name: 'page', required: false, description: 'So trang (mac dinh: 1)' })
  @ApiQuery({ name: 'itemPerPage', required: false, description: 'So phan tu moi trang (mac dinh: 10)' })
  @ApiResponse({ status: 200, description: 'Lay danh sach lenh rut tien thanh cong.' })
  async getWithdrawals(
    @Query(new ParseParamsPaginationPipe()) pagination: Pagination,
    @Query('status') status?: 'pending' | 'approved' | 'rejected',
  ) {
    return this.walletsService.getAdminWithdrawals(pagination, status)
  }

  @Post(':id/review')
  @UsePipes(new ZodValidationPipe())
  @ApiOperation({ summary: '[ADMIN] Duyet hoac tu choi lenh rut tien' })
  @ApiBody({ type: ReviewWithdrawalSwaggerDto })
  @ApiResponse({ status: 200, description: 'Duyet lenh rut tien thanh cong.' })
  async reviewWithdrawal(@Param('id') id: string, @Body() reviewDto: ReviewWithdrawalDto) {
    return await this.walletsService.reviewWithdrawal(id, reviewDto)
  }
}
