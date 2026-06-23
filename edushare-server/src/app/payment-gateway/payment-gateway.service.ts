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
    // 💡 LỐI ĐI TẮT DÀNH CHO DEVELOPER TEST TRÊN SWAGGER (Bypass Signature)
    if (!webhookBody.signature) {
      if (webhookBody.data && webhookBody.data.orderCode) {
        if (webhookBody.data.status === 'PAID') {
          await this.walletsService.addBalanceFromPayOS(webhookBody.data.orderCode)
          return { status: 'success', message: 'Giả lập Nạp tiền thành công (Bypass Signature)' }
        }
        // Giả lập Hủy trên Swagger bằng cách truyền body.data.status = 'CANCELLED'
        else if (webhookBody.data.status === 'CANCELLED') {
          // Gọi hàm xử lý hủy thông qua walletsService cho đồng bộ
          await this.walletsService.cancelTopupFromPayOS(webhookBody.data.orderCode)
          return { status: 'success', message: 'Giả lập Hủy thành công (Bypass Signature)' }
        }
      }
    }

    try {
      // --- LUỒNG CHẠY THẬT CỦA PAYOS (Giữ nguyên để khi lên Production hoạt động bảo mật) ---
      // verify() xác thực chữ ký và trả về webhook.data trực tiếp
      // webhookBody.status KHÔNG tồn tại trong payload server nhận — chỉ có trong URL redirect browser
      const verifiedData = await this.payos.webhooks.verify(webhookBody)

      // verifiedData.code === '00' nghĩa là giao dịch THÀNH CÔNG (data-level code)
      // PayOS KHÔNG gửi webhook khi user hủy → chỉ redirect browser về cancelUrl
      if (verifiedData && verifiedData.code === '00') {
        await this.walletsService.addBalanceFromPayOS(verifiedData.orderCode)
      }

      return { status: 'success' }
    } catch (error) {
      // Trả về lỗi nếu chữ ký webhook bị sai (có kẻ cố tình hack dữ liệu nạp tiền)
      return { status: 'invalid signature' }
    }
  }
}
