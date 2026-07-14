import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsNotEmpty, IsNumber } from 'class-validator'

export class UpgradeVipDto {
  @ApiProperty({ description: 'Số tháng muốn nâng cấp (1, 6, hoặc 12)', enum: [1, 6, 12] })
  @IsNotEmpty()
  @IsNumber()
  @IsIn([1, 6, 12])
  months: number
}
