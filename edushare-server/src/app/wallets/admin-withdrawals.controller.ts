import { Body, Controller, Param, Post, UsePipes } from '@nestjs/common'
import { ApiBody } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from '../users/entities/user.entity'
import { WalletsService } from './wallets.service'
import { ReviewWithdrawalDto, ReviewWithdrawalSwaggerDto } from './dto/review-withdrawal.dto'

@Controller('admin/withdrawals')
@Roles(UserRole.ADMIN)
export class AdminWithdrawalsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post(':id/review')
  @UsePipes(new ZodValidationPipe())
  @ApiBody({ type: ReviewWithdrawalSwaggerDto })
  async reviewWithdrawal(@Param('id') id: string, @Body() reviewDto: ReviewWithdrawalDto) {
    return await this.walletsService.reviewWithdrawal(id, reviewDto)
  }
}
