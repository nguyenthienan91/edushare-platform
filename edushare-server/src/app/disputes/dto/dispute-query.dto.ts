import { ApiPropertyOptional } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { DisputeStatus } from '../schemas/dispute.schema'
import { PagingDefault } from '../../../common/utils/pagination-util/pagination-util.interface'

const DisputeQuerySchema = z.object({
  status: z.nativeEnum(DisputeStatus).optional(),
  page: z.coerce.number().min(1).default(PagingDefault.PAGE),
  itemPerPage: z.coerce.number().min(1).default(PagingDefault.ITEM_PER_PAGE),
})

export class DisputeQueryDto extends createZodDto(DisputeQuerySchema) {}

export class DisputeQuerySwaggerDto {
  @ApiPropertyOptional({ enum: DisputeStatus, description: 'Filter by dispute status' })
  status?: DisputeStatus

  @ApiPropertyOptional({ example: 1, default: 1 })
  page?: number

  @ApiPropertyOptional({ example: 10, default: 10 })
  itemPerPage?: number
}
