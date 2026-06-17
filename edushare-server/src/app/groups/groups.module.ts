import { Module, forwardRef } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { GroupsController } from './groups.controller'
import { AdminGroupsController } from './admin-groups.controller'
import { Group, GroupSchema } from './entities/group.entity'
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module'
import { UsersModule } from '../users/users.module'
import { PaginationUtilModule } from '../../common/utils/pagination-util/pagination-util.module'
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    forwardRef(() => UsersModule),
    PaginationUtilModule,
  ],
  controllers: [GroupsController, AdminGroupsController],
  providers: [GroupsService],
  exports: [GroupsService, MongooseModule],
})
export class GroupsModule {}
