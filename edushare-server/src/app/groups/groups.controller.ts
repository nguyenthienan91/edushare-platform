import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { CreateGroupDto } from './dto/create-group.dto'
import { UpdateGroupDto } from './dto/update-group.dto'
import { User } from '../../common/decorators/user.decorator'
import type { UserInfo } from '../../common/decorators/user.decorator'

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto, @User() user: UserInfo) {
    return this.groupsService.create(createGroupDto, user.userID)
  }

  @Get()
  findAll() {
    return this.groupsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne({ _id: id })
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update({ _id: id }, updateGroupDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove({ _id: id })
  }
}
