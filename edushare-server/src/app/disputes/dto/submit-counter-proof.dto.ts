import { ApiProperty } from '@nestjs/swagger'

export class SubmitCounterProofSwaggerDto {
  @ApiProperty({
    description: 'Counter-evidence image files (jpg/png/jpeg)',
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  files!: Express.Multer.File[]
}
