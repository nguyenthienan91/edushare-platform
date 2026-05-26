import { Controller, Get, Patch, Param, Query, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { AuthGuard } from '../auth/auth.guard'
import { NotificationsService } from './notification.service'

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thông báo của bản thân (Có phân trang)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'itemPerPage', required: false, example: 10 })
  async getMyNotifications(@Req() req: any, @Query('page') page?: number, @Query('itemPerPage') itemPerPage?: number) {
    const userId = req.user.userID // Lấy ID từ Token của bạn
    return await this.notificationsService.getUserNotifications(userId, page, itemPerPage)
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Đánh dấu một thông báo là đã đọc' })
  async readNotification(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userID
    return await this.notificationsService.markAsRead(id, userId)
  }
}
