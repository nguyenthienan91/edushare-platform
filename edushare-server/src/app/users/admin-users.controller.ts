import { Controller, Param, Patch } from '@nestjs/common'
import { Roles } from '../../common/decorators/roles.decorator'
import { UsersService } from './users.service'
import { UserRole } from './entities/user.entity'

@Controller('admin/users')
@Roles(UserRole.ADMIN)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id/ban')
  banUser(@Param('id') id: string) {
    return this.usersService.banUser(id)
  }

  @Patch(':id/unban')
  unbanUser(@Param('id') id: string) {
    return this.usersService.unbanUser(id)
  }
}
