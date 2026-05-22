import { ApiProperty } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const WithdrawRequestSchema = z.object({
  amount: z.number().min(50000),
  bankName: z.string().min(1),
  accountNumber: z.string().min(1),
  accountName: z
    .string()
    .min(1)
    .regex(/^[A-Z0-9\s]+$/),
})

export class WithdrawRequestDto extends createZodDto(WithdrawRequestSchema) {}

export class WithdrawRequestSwaggerDto {
  @ApiProperty({
    description: 'Amount to withdraw (VND)',
    example: 50000,
    minimum: 50000,
    type: Number,
  })
  amount!: number

  @ApiProperty({ description: 'Bank name' })
  bankName!: string

  @ApiProperty({ description: 'Bank account number' })
  accountNumber!: string

  @ApiProperty({ description: 'Account holder name, uppercase without accents' })
  accountName!: string
}
