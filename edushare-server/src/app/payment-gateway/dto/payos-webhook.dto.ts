import { ApiProperty } from '@nestjs/swagger'

export class WebhookDataDto {
  @ApiProperty({
    description: 'Mã số hóa đơn (orderCode) lấy từ bảng topups trong DB',
    example: 171603456,
    type: Number,
  })
  orderCode!: number

  @ApiProperty({
    description: 'Trạng thái giao dịch do PayOS trả về',
    example: 'PAID',
    enum: ['PAID', 'CANCELLED', 'PENDING'],
    type: String,
  })
  status!: string
}

export class PayOSWebhookDto {
  @ApiProperty({
    description: 'Mã phản hồi kết quả giao dịch (00 có nghĩa là thành công)',
    example: '00',
    type: String,
  })
  code!: string

  @ApiProperty({
    description: 'Dữ liệu chi tiết của giao dịch thanh toán',
    type: WebhookDataDto,
  })
  data!: WebhookDataDto
}
