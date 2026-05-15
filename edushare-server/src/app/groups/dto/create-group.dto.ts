import { createZodDto } from 'nestjs-zod'
import { GroupSchema } from '../schema/group.zod'

const CreateGroupSchema = GroupSchema.omit({
  id: true,
  occupiedSlots: true,
  status: true,
  members: true,
  ownerId: true,
})

export class CreateGroupDto extends createZodDto(CreateGroupSchema) {}
