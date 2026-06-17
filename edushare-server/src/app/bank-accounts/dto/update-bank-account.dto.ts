import { ApiProperty } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { CreateBankAccountSchema } from './create-bank-account.dto'

export const UpdateBankAccountSchema = CreateBankAccountSchema.partial()

export class UpdateBankAccountDto extends createZodDto(UpdateBankAccountSchema) {}

export class UpdateBankAccountSwaggerDto {
  @ApiProperty({ description: 'Bank name', example: 'Vietcombank', required: false })
  bankName?: string

  @ApiProperty({ description: 'Bank account number', example: '1234567890', required: false })
  accountNumber?: string

  @ApiProperty({
    description: 'Account holder name, uppercase without accents',
    example: 'NGUYEN THIEN AN',
    required: false,
  })
  accountName?: string

  @ApiProperty({ description: 'Bank branch (optional)', example: 'CN Ho Chi Minh', required: false })
  branch?: string

  @ApiProperty({ description: 'Whether this is the default bank account (optional)', example: false, required: false })
  isDefault?: boolean
}
