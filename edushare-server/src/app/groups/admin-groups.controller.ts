import { Body, Controller, Param, Patch, UsePipes } from '@nestjs/common'
import { ZodValidationPipe } from 'nestjs-zod'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from '../users/entities/user.entity'
import { GroupsService } from './groups.service'
import { AdminUpdateGroupStatusDto } from './dto/admin-update-group-status.dto'

@Controller('admin/groups')
@Roles(UserRole.ADMIN)
export class AdminGroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Patch(':id/status')
  @UsePipes(new ZodValidationPipe())
  updateStatus(@Param('id') id: string, @Body() dto: AdminUpdateGroupStatusDto) {
    return this.groupsService.updateStatusAdmin(id, dto.status)
  }
}
