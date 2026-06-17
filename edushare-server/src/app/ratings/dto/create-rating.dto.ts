import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/)

const CreateRatingSchema = z.object({
  transactionId: objectIdSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().optional(),
})

export class CreateRatingDto extends createZodDto(CreateRatingSchema) {}
