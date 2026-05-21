// src/app/transactions/dto/admin-transaction-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsEnum, IsNumber, Min } from 'class-validator'
import { EscrowStatus } from '../enums/escrow-status.enum' // Hãy đảm bảo import đúng enum của bạn nhé
import { Type } from 'class-transformer'

export class AdminTransactionQueryDto {
  @ApiPropertyOptional({
    description: 'Lọc danh sách giao dịch theo trạng thái',
    enum: EscrowStatus,
    example: EscrowStatus.PROOF_SUBMITTED,
  })
  @IsOptional()
  @IsEnum(EscrowStatus)
  status?: string

  @ApiPropertyOptional({ description: 'Số trang muốn lấy', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number) // Ép kiểu từ string trên URL thành number
  @IsNumber()
  @Min(1)
  page?: number

  @ApiPropertyOptional({ description: 'Số lượng giao dịch trên mỗi trang', example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  itemPerPage?: number
}
