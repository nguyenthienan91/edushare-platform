import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { PaymentGatewayService } from './payment-gateway.service'
import { AuthGuard } from '../auth/auth.guard'
import { CreateDepositLinkDto } from './dto/create-deposit-link.dto'
import { PayOSWebhookDto } from './dto/payos-webhook.dto'
import { ApiBody, ApiOperation } from '@nestjs/swagger'
import { Public } from '../../common/decorators/roles.decorator'
import { CancelDepositDto } from './dto/cancel-deposit.dto'

@Controller('payment-gateway')
export class PaymentGatewayController {
  constructor(private readonly paymentService: PaymentGatewayService) {}

  // Endpoint cho người dùng bấm nạp tiền từ giao diện
  @Post('create-link')
  @UseGuards(AuthGuard)
  async createLink(@Req() req: any, @Body() createDepositLinkDto: CreateDepositLinkDto) {
    const userId = req.user.userID // Lấy ID người dùng từ Token đăng nhập
    return await this.paymentService.createDepositLink(userId, createDepositLinkDto.amount)
  }

  // Endpoint công khai để nhận Webhook từ PayOS bắn về
  @Post('webhook')
  @Public()
  @ApiBody({ type: PayOSWebhookDto })
  async handleWebhook(@Body() webhookBody: PayOSWebhookDto) {
    return await this.paymentService.handlePayOSWebhook(webhookBody)
  }

  // Endpoint cho frontend gọi khi PayOS redirect về với cancel=true
  // Frontend detect ?cancel=true trong cancelUrl rồi gọi API này để set trạng thái failed
  @Post('cancel')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Hủy lệnh nạp tiền khi user bấm Hủy trên trang PayOS' })
  @ApiBody({ type: CancelDepositDto })
  async cancelDeposit(@Body() body: CancelDepositDto) {
    return await this.paymentService.cancelDeposit(body.orderCode)
  }
}
