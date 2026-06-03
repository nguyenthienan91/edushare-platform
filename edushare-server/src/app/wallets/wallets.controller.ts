import { Body, Controller, Get, Post, Query, UseGuards, UsePipes } from '@nestjs/common'
import { ApiBody } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { AuthGuard } from '../auth/auth.guard'
import { User, type UserInfo } from '../../common/decorators/user.decorator'
import { ParseParamsPaginationPipe } from '../../common/pipes/parse-params-pagination.pipe'
import { Pagination } from '../../common/utils/pagination-util/pagination-util.interface'
import { WalletsService } from './wallets.service'
import { WithdrawRequestDto, WithdrawRequestSwaggerDto } from './dto/withdraw-request.dto'

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async getMyWallet(@User() user: UserInfo) {
    const userId = user.userID
    return await this.walletsService.getWalletByUserId(userId)
  }

  @Post('withdraw')
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe())
  @ApiBody({ type: WithdrawRequestSwaggerDto })
  async requestWithdraw(@User() user: UserInfo, @Body() withdrawRequestDto: WithdrawRequestDto) {
    const userId = user.userID
    return await this.walletsService.requestWithdraw(userId, withdrawRequestDto)
  }

  @Get('history/topups')
  @UseGuards(AuthGuard)
  async getTopupHistory(@User() user: UserInfo, @Query(new ParseParamsPaginationPipe()) pagination: Pagination) {
    const userId = user.userID
    return await this.walletsService.getTopupHistory(userId, pagination)
  }

  @Get('history/withdrawals')
  @UseGuards(AuthGuard)
  async getWithdrawalHistory(@User() user: UserInfo, @Query(new ParseParamsPaginationPipe()) pagination: Pagination) {
    const userId = user.userID
    return await this.walletsService.getWithdrawalHistory(userId, pagination)
  }

  @Get('history')
  @UseGuards(AuthGuard)
  async getWalletHistory(@User() user: UserInfo, @Query(new ParseParamsPaginationPipe()) pagination: Pagination) {
    const userId = user.userID
    return await this.walletsService.getWalletHistory(userId, pagination)
  }
}
