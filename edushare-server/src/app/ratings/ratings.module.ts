import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { RatingsController } from './ratings.controller'
import { RatingsService } from './ratings.service'
import { Rating, RatingSchema } from './schemas/rating.schema'
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema'
import { Group, GroupSchema } from '../groups/entities/group.entity'
import { User, UserSchema } from '../users/entities/user.entity'
import { PaginationUtilModule } from '../../common/utils/pagination-util/pagination-util.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Rating.name, schema: RatingSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Group.name, schema: GroupSchema },
      { name: User.name, schema: UserSchema },
    ]),
    PaginationUtilModule,
  ],
  controllers: [RatingsController],
  providers: [RatingsService],
})
export class RatingsModule {}
