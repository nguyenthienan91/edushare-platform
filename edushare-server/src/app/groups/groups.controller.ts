import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { ApiQuery } from '@nestjs/swagger'
import { GroupCategory, GroupStatus } from './entities/group.entity'
import { GroupsService } from './groups.service'
import { CreateGroupDto } from './dto/create-group.dto'
import { UpdateGroupDto } from './dto/update-group.dto'
import { User } from '../../common/decorators/user.decorator'
import type { UserInfo } from '../../common/decorators/user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from '../users/entities/user.entity'
import { ParseParamsPaginationPipe } from '../../common/pipes/parse-params-pagination.pipe'
import { Pagination } from '../../common/utils/pagination-util/pagination-util.interface'

@Controller('groups')
@Roles(UserRole.ADMIN, UserRole.MEMBER)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto, @User() user: UserInfo) {
    return this.groupsService.create(createGroupDto, user.userID)
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'itemPerPage', required: false, type: Number })
  findAll(@Query(new ParseParamsPaginationPipe()) pagination: Pagination) {
    return this.groupsService.findAll(pagination)
  }

  @Get('sort/price')
  @Roles()
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'itemPerPage', required: false, type: Number })
  sortByPrice(
    @Query('order') order: 'asc' | 'desc' | undefined,
    @Query(new ParseParamsPaginationPipe()) pagination: Pagination,
  ) {
    return this.groupsService.sortByPrice(order, pagination)
  }

  @Get('search')
  @Roles()
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'description', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, enum: GroupCategory })
  @ApiQuery({ name: 'status', required: false, enum: GroupStatus })
  @ApiQuery({ name: 'ownerId', required: false, type: String })
  @ApiQuery({ name: 'members', required: false, type: String })
  @ApiQuery({ name: 'totalSlots', required: false, type: Number })
  @ApiQuery({ name: 'occupiedSlots', required: false, type: Number })
  @ApiQuery({ name: 'totalPrice', required: false, type: Number })
  @ApiQuery({ name: 'price', required: false, type: Number })
  @ApiQuery({ name: 'expiredAt', required: false, type: String, format: 'date-time' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'itemPerPage', required: false, type: Number })
  search(
    @Query() query: Record<string, string | string[] | undefined>,
    @Query(new ParseParamsPaginationPipe()) pagination: Pagination,
  ) {
    return this.groupsService.search(query, pagination)
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

  @Post(':id/join/members/:memberId')
  @Roles()
  join(@Param('id') id: string, @Param('memberId') memberId: string) {
    return this.groupsService.joinGroup(id, memberId)
  }

  @Delete(':id/members/:userId')
  @Roles()
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.groupsService.removeMember(id, userId)
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string, @User() user: UserInfo) {
    return this.groupsService.getGroupMembers(id, user.userID, user.role)
  }
}
