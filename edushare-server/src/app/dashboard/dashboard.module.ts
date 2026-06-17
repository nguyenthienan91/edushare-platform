import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from '../users/entities/user.entity'
import { Group, GroupSchema } from '../groups/entities/group.entity'
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema'
import { Topup, TopupSchema } from '../wallets/schemas/topup.schema'
import { Withdrawal, WithdrawalSchema } from '../wallets/schemas/withdrawal.schema'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { AdminDashboardController } from './admin-dashboard.controller'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Topup.name, schema: TopupSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
    ]),
    AuthModule,
    UsersModule,
  ],
  controllers: [AdminDashboardController, DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
