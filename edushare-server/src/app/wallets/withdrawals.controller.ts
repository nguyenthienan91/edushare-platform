import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common'
import { ApiBody } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { AuthGuard } from '../auth/auth.guard'
import { User, type UserInfo } from '../../common/decorators/user.decorator'
import { WalletsService } from './wallets.service'
import { WithdrawRequestDto, WithdrawRequestSwaggerDto } from './dto/withdraw-request.dto'

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe())
  @ApiBody({ type: WithdrawRequestSwaggerDto })
  async requestWithdraw(@User() user: UserInfo, @Body() withdrawRequestDto: WithdrawRequestDto) {
    const userId = user.userID
    return await this.walletsService.requestWithdraw(userId, withdrawRequestDto)
  }
}
