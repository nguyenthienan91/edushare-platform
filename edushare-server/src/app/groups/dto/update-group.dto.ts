import { createZodDto } from 'nestjs-zod'
import { GroupSchema } from '../schemas/group.zod'

const UpdateGroupSchema = GroupSchema.omit({
  id: true,
  occupiedSlots: true,
  price: true,
  status: true,
  members: true,
  ownerId: true,
}).partial()

export class UpdateGroupDto extends createZodDto(UpdateGroupSchema) {}
