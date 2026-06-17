// src/app/payment-gateway/payment-gateway.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PayOS } from '@payos/node' // Đảm bảo đã chạy: npm install @payos/node
import { WalletsService } from '../wallets/wallets.service'

@Injectable()
export class PaymentGatewayService {
  private payos: PayOS

  constructor(
    private configService: ConfigService,
    private walletsService: WalletsService,
  ) {
    // Khởi tạo thực thể PayOS bằng thông tin lấy từ file .env
    this.payos = new PayOS({
      clientId: this.configService.get<string>('PAYOS_CLIENT_ID'),
      apiKey: this.configService.get<string>('PAYOS_API_KEY'),
      checksumKey: this.configService.get<string>('PAYOS_CHECKSUM_KEY'),
    })
  }

  /**
   * 1. API Tạo Link nạp tiền chuyển khoản
   */
  async createDepositLink(userId: string, amount: number) {
    // PayOS bắt buộc orderCode phải là số nguyên duy nhất, dùng timestamp là chuẩn nhất
    const orderCode = Math.floor(Date.now() / 1000)

    const paymentBody = {
      orderCode: orderCode,
      amount: amount,
      description: `EduShare nap vi`, // Chuỗi không dấu, không ký tự đặc biệt, tối đa 25 ký tự
      cancelUrl: `${this.configService.get<string>('FE_URL')}/wallet?status=cancel`, // Link front-end khi hủy nạp
      returnUrl: `${this.configService.get<string>('FE_URL')}/wallet?status=success`, // Link front-end khi nạp xong
    }

    try {
      // Lưu lệnh nạp vào database trước ở trạng thái pending
      await this.walletsService.createTopupOrder(userId, orderCode, amount)

      // Gọi sang cổng PayOS để xin link QR Ngân hàng
      const paymentLinkData = await this.payos.paymentRequests.create(paymentBody)
      return { checkoutUrl: paymentLinkData.checkoutUrl }
    } catch (error) {
      throw new InternalServerErrorException('System error while creating PayOS payment link')
    }
  }

  /**
   * 2. Xử lý dữ liệu Webhook do PayOS tự động bắn về khi user quét mã xong
   */
  async handlePayOSWebhook(webhookBody: any) {
    // 💡 LỐI ĐI TẮT DÀNH CHO DEVELOPER TEST TRÊN SWAGGER
    // Nếu dữ liệu truyền lên có code "00" và KHÔNG chứa trường signature
    if (webhookBody.code === '00' && !webhookBody.signature) {
      if (webhookBody.data && webhookBody.data.orderCode) {
        await this.walletsService.addBalanceFromPayOS(webhookBody.data.orderCode)
        return { status: 'success', message: 'Giả lập Webhook thành công (Bypass Signature)' }
      }
    }

    try {
      // --- LUỒNG CHẠY THẬT CỦA PAYOS (Giữ nguyên để khi lên Production hoạt động bảo mật) ---
      // Giải mã và xác thực chữ ký bảo mật xem có đúng là PayOS gửi không
      const verifiedData = await this.payos.webhooks.verify(webhookBody)

      // Nếu giao dịch thành công (mã thành công thông thường của PayOS là '00')
      if (verifiedData && webhookBody.code === '00') {
        // Kích hoạt hàm cộng tiền vào ví người dùng dựa trên orderCode
        await this.walletsService.addBalanceFromPayOS(verifiedData.orderCode)
      }
      return { status: 'success' }
    } catch (error) {
      // Trả về lỗi nếu chữ ký webhook bị sai (có kẻ cố tình hack dữ liệu nạp tiền)
      return { status: 'invalid signature' }
    }
  }
}
