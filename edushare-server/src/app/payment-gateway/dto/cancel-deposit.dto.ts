import { ApiProperty } from '@nestjs/swagger'

export class CancelDepositDto {
  @ApiProperty({
    description: 'Mã orderCode lấy từ URL redirect của PayOS (?orderCode=xxx)',
    example: 1782215238,
    type: Number,
  })
  orderCode!: number
}
