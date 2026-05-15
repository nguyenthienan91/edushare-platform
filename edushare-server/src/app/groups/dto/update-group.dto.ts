import { createZodDto } from 'nestjs-zod'
import { GroupSchema } from '../schema/group.zod'

const UpdateGroupSchema = GroupSchema.omit({
  id: true,
  occupiedSlots: true,
  status: true,
  members: true,
  ownerId: true,
}).partial()

export class UpdateGroupDto extends createZodDto(UpdateGroupSchema) {}
