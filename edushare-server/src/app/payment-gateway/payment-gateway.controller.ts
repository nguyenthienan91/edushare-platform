import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { PaymentGatewayService } from './payment-gateway.service'
import { AuthGuard } from '../auth/auth.guard'
import { CreateDepositLinkDto } from './dto/create-deposit-link.dto'
import { PayOSWebhookDto } from './dto/payos-webhook.dto'
import { ApiBody } from '@nestjs/swagger'

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
  @ApiBody({ type: PayOSWebhookDto })
  async handleWebhook(@Body() webhookBody: PayOSWebhookDto) {
    return await this.paymentService.handlePayOSWebhook(webhookBody)
  }
}
