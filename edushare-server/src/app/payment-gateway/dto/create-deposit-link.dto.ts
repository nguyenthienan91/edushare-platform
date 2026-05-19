// src/app/payment-gateway/dto/create-deposit-link.dto.ts
import { ApiProperty } from '@nestjs/swagger'

export class CreateDepositLinkDto {
  @ApiProperty({
    description: 'Số tiền người dùng muốn nạp vào ví (VNĐ)',
    example: 50000,
    minimum: 1000,
    type: Number,
  })
  amount!: number
}
