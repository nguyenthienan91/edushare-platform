import { ApiProperty } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const ResolveDisputeSchema = z.object({
  resolution: z.enum(['refund', 'payout']),
})

export class ResolveDisputeDto extends createZodDto(ResolveDisputeSchema) {}

export class ResolveDisputeSwaggerDto {
  @ApiProperty({
    description: 'Resolution decision: refund the member or payout the owner',
    enum: ['refund', 'payout'],
    example: 'refund',
  })
  resolution!: 'refund' | 'payout'
}
