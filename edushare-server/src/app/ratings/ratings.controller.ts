import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiQuery } from '@nestjs/swagger'
import { RatingsService } from './ratings.service'
import { CreateRatingDto } from './dto/create-rating.dto'
import { User } from '../../common/decorators/user.decorator'
import type { UserInfo } from '../../common/decorators/user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from '../users/entities/user.entity'
import { ParseParamsPaginationPipe } from '../../common/pipes/parse-params-pagination.pipe'
import { Pagination } from '../../common/utils/pagination-util/pagination-util.interface'

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get('me')
  @ApiQuery({ name: 'type', required: false, enum: ['received', 'sent'], default: 'received' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'itemPerPage', required: false, type: Number })
  async getMyRatings(
    @User() user: UserInfo,
    @Query('type') type: 'received' | 'sent' = 'received',
    @Query(new ParseParamsPaginationPipe()) pagination: Pagination,
  ) {
    const userId = user.userID
    return this.ratingsService.getRatingsMe(userId, type, pagination)
  }

  @Post()
  @Roles(UserRole.MEMBER, UserRole.ADMIN)
  create(@Body() createRatingDto: CreateRatingDto, @User() user: UserInfo) {
    return this.ratingsService.create(user.userID, createRatingDto)
  }
}
