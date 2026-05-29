import { ApiProperty } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const CreateDisputeSchema = z.object({
  transactionId: z.string().length(24),
  reason: z.string().min(10),
})

export class CreateDisputeDto extends createZodDto(CreateDisputeSchema) {}

export class CreateDisputeSwaggerDto {
  @ApiProperty({ description: 'ID of the transaction being disputed', example: '665f1a2b3c4d5e6f7a8b9c0d' })
  transactionId!: string

  @ApiProperty({
    description: 'Reason for the dispute (min 10 characters)',
    example: 'The group owner never shared the account credentials.',
  })
  reason!: string

  @ApiProperty({
    description: 'Evidence image files (jpg/png/jpeg)',
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  files!: Express.Multer.File[]
}
