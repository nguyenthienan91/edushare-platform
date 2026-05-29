// src/app/disputes/admin-disputes.controller.ts
import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger'
import { AuthGuard } from '../auth/auth.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from '../users/entities/user.entity'
import { DisputesService } from './disputes.service'
import { DisputeQueryDto } from './dto/dispute-query.dto'
import { ResolveDisputeDto, ResolveDisputeSwaggerDto } from './dto/resolve-dispute.dto'

@ApiTags('Admin — Disputes')
@UseGuards(AuthGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/disputes')
export class AdminDisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tranh chấp, có thể lọc theo trạng thái và phân trang' })
  async getAll(@Query() query: DisputeQueryDto) {
    return await this.disputesService.getDisputes(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một tranh chấp theo ID' })
  async getById(@Param('id') id: string) {
    return await this.disputesService.getDisputeById(id)
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Đưa ra phán quyết: hoàn tiền cho thành viên hoặc giải ngân cho chủ nhóm' })
  @ApiBody({ type: ResolveDisputeSwaggerDto })
  async resolve(@Param('id') id: string, @Body() dto: ResolveDisputeDto) {
    return await this.disputesService.resolveDisputeByAdmin(id, dto.resolution)
  }
}
