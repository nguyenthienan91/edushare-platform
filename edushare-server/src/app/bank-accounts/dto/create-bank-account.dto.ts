import { ApiProperty } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const CreateBankAccountSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  accountName: z
    .string()
    .min(1, 'Account holder name is required')
    .regex(/^[A-Z0-9\s]+$/, 'Account holder name must be uppercase without accents (letters, numbers and spaces only)'),
  branch: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
})

export class CreateBankAccountDto extends createZodDto(CreateBankAccountSchema) {}

export class CreateBankAccountSwaggerDto {
  @ApiProperty({ description: 'Bank name', example: 'Vietcombank' })
  bankName!: string

  @ApiProperty({ description: 'Bank account number', example: '1234567890' })
  accountNumber!: string

  @ApiProperty({ description: 'Account holder name, uppercase without accents', example: 'NGUYEN THIEN AN' })
  accountName!: string

  @ApiProperty({ description: 'Bank branch (optional)', example: 'CN Ho Chi Minh', required: false })
  branch?: string

  @ApiProperty({ description: 'Whether this is the default bank account (optional)', example: false, required: false })
  isDefault?: boolean
}
