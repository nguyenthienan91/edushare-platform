import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Inject, forwardRef } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from './entities/user.entity'
import { User } from '../../common/decorators/user.decorator'
import type { UserInfo } from '../../common/decorators/user.decorator'
import { AuthGuard } from '../auth/auth.guard'
import { ApiOperation } from '@nestjs/swagger'
import { GroupsService } from '../groups/groups.service'

@Controller('users')
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => GroupsService))
    private readonly groupsService: GroupsService,
  ) {}

  @Patch('me')
  @Roles()
  updateMe(@User() user: UserInfo, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.userID, updateUserDto)
  }

  @Get('me')
  @Roles()
  getMe(@User() user: UserInfo) {
    return this.usersService.findByIdWithBalance(user.userID)
  }

  @Get('me/dashboard-stats')
  @Roles()
  getMeDashboardStats(@User() user: UserInfo) {
    return this.groupsService.getDashboardStats(user.userID)
  }

  @Post('upgrade-vip')
  @Roles()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Dùng 29k trong ví để mua/gia hạn gói VIP hệ thống' })
  async upgradeVip(@Req() req: any) {
    const userId = req.user.userID
    return await this.usersService.purchaseVipSubscription(userId)
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @Get()
  findAll() {
    return this.usersService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id)
  }
}
