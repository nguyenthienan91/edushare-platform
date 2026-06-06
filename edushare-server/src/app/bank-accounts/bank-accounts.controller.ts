import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UsePipes } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { AuthGuard } from '../auth/auth.guard'
import { User, type UserInfo } from '../../common/decorators/user.decorator'
import { BankAccountsService } from './bank-accounts.service'
import { CreateBankAccountDto, CreateBankAccountSwaggerDto } from './dto/create-bank-account.dto'
import { UpdateBankAccountDto, UpdateBankAccountSwaggerDto } from './dto/update-bank-account.dto'

@ApiTags('Bank Accounts (Tài khoản ngân hàng)')
@UseGuards(AuthGuard)
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Thêm tài khoản ngân hàng mới (tối đa 3 tài khoản)' })
  @UsePipes(new ZodValidationPipe())
  @ApiBody({ type: CreateBankAccountSwaggerDto })
  async create(@User() user: UserInfo, @Body() createBankAccountDto: CreateBankAccountDto) {
    const userId = user.userID
    return await this.bankAccountsService.create(userId, createBankAccountDto)
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tài khoản ngân hàng của bản thân' })
  async findAll(@User() user: UserInfo) {
    const userId = user.userID
    return await this.bankAccountsService.findAll(userId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một tài khoản ngân hàng' })
  async findOne(@User() user: UserInfo, @Param('id') id: string) {
    const userId = user.userID
    return await this.bankAccountsService.findOne(userId, id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật tài khoản ngân hàng' })
  @UsePipes(new ZodValidationPipe())
  @ApiBody({ type: UpdateBankAccountSwaggerDto })
  async update(@User() user: UserInfo, @Param('id') id: string, @Body() updateBankAccountDto: UpdateBankAccountDto) {
    const userId = user.userID
    return await this.bankAccountsService.update(userId, id, updateBankAccountDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tài khoản ngân hàng' })
  async remove(@User() user: UserInfo, @Param('id') id: string) {
    const userId = user.userID
    return await this.bankAccountsService.remove(userId, id)
  }
}
