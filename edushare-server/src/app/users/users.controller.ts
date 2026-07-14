import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Inject,
  forwardRef,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import 'multer'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UpgradeVipDto } from './dto/upgrade-vip.dto'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from './entities/user.entity'
import { User } from '../../common/decorators/user.decorator'
import type { UserInfo } from '../../common/decorators/user.decorator'
import { AuthGuard } from '../auth/auth.guard'
import { ApiConsumes, ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { GroupsService } from '../groups/groups.service'
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service'
import { ParseParamsPaginationPipe } from '../../common/pipes/parse-params-pagination.pipe'
import { Pagination } from '../../common/utils/pagination-util/pagination-util.interface'

@Controller('users')
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => GroupsService))
    private readonly groupsService: GroupsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Patch('me/avatar')
  @Roles()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async updateAvatar(@User() user: UserInfo, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Please upload an avatar image.')
    }
    try {
      const uploadResult = await this.cloudinaryService.uploadImage(file, 'edushare_avatars')
      const secureUrl = uploadResult.secure_url
      return await this.usersService.update(user.userID, { avatar: secureUrl })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new BadRequestException('Failed to upload avatar: ' + message)
    }
  }

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
  @ApiOperation({ summary: 'Dùng tiền trong ví để mua/gia hạn gói VIP hệ thống (1, 6, 12 tháng)' })
  async upgradeVip(@Req() req: any, @Body() body: UpgradeVipDto) {
    const userId = req.user.userID
    return await this.usersService.purchaseVipSubscription(userId, body.months)
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @Get()
  @ApiOperation({ summary: '[ADMIN] Lay danh sach user co phan trang va tim kiem' })
  @ApiQuery({ name: 'page', required: false, description: 'So trang (mac dinh: 1)' })
  @ApiQuery({ name: 'itemPerPage', required: false, description: 'So phan tu moi trang (mac dinh: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Tim kiem theo ten hoac email' })
  @ApiQuery({ name: 'role', required: false, enum: ['guest', 'member', 'admin'], description: 'Loc theo role' })
  findAll(
    @Query(new ParseParamsPaginationPipe()) pagination: Pagination,
    @Query('search') search?: string,
    @Query('role') role?: 'guest' | 'member' | 'admin',
  ) {
    return this.usersService.findAllWithPagination(pagination, search, role as any)
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
