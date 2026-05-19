import z from 'zod'

export const GroupStatusEnum = z.enum(['available', 'full', 'expired'])
export const GroupCategoryEnum = z.enum(['Productivity', 'Design', 'AI Tools'])

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/)

export const GroupSchema = z.object({
  id: objectIdSchema,
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  category: GroupCategoryEnum,
  totalSlots: z.number().int().min(1),
  occupiedSlots: z.number().int().min(0),
  totalPrice: z.number().finite().min(0),
  price: z.number().finite().min(0),
  status: GroupStatusEnum,
  ownerId: objectIdSchema,
  members: z.array(objectIdSchema),
  expiredAt: z.string().datetime({ offset: true }).nullable().optional(),
})

export type GroupSchemaType = z.infer<typeof GroupSchema>
