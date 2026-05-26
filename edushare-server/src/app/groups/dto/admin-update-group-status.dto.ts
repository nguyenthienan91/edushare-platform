import { createZodDto } from 'nestjs-zod'
import z from 'zod'
import { GroupStatus } from '../entities/group.entity'

const AdminGroupStatusSchema = z.object({
  status: z.enum([GroupStatus.CLOSED, GroupStatus.HIDDEN]),
})

export class AdminUpdateGroupStatusDto extends createZodDto(AdminGroupStatusSchema) {}
