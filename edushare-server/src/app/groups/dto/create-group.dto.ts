import { createZodDto } from 'nestjs-zod'
import { GroupSchema } from '../schemas/group.zod'

const CreateGroupSchema = GroupSchema.omit({
  id: true,
  occupiedSlots: true,
  price: true,
  status: true,
  members: true,
  ownerId: true,
})

export class CreateGroupDto extends createZodDto(CreateGroupSchema) {}
