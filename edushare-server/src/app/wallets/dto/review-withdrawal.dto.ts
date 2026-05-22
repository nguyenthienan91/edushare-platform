import { ApiProperty } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const ReviewWithdrawalSchema = z
  .object({
    status: z.enum(['approved', 'rejected']),
    rejectReason: z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'rejected' && !data.rejectReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'rejectReason is required when status is rejected',
        path: ['rejectReason'],
      })
    }
  })

export class ReviewWithdrawalDto extends createZodDto(ReviewWithdrawalSchema) {}

export class ReviewWithdrawalSwaggerDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  status!: 'approved' | 'rejected'

  @ApiProperty({ required: false, description: 'Reason for rejection (required when status is rejected)' })
  rejectReason?: string
}
