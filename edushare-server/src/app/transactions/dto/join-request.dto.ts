// src/app/transactions/dto/join-request.dto.ts
import { ApiProperty } from '@nestjs/swagger'

export class JoinRequestDto {
  @ApiProperty({
    description: 'ID của nhóm phần mềm dùng chung (Group ID)',
    example: '6a0bf0fad5776f9d78556f17',
    type: String,
  })
  groupId!: string
}
