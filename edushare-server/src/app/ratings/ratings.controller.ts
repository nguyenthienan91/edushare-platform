import { Body, Controller, Post } from '@nestjs/common'
import { RatingsService } from './ratings.service'
import { CreateRatingDto } from './dto/create-rating.dto'
import { User } from '../../common/decorators/user.decorator'
import type { UserInfo } from '../../common/decorators/user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from '../users/entities/user.entity'

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @Roles(UserRole.MEMBER, UserRole.ADMIN)
  create(@Body() createRatingDto: CreateRatingDto, @User() user: UserInfo) {
    return this.ratingsService.create(user.userID, createRatingDto)
  }
}
