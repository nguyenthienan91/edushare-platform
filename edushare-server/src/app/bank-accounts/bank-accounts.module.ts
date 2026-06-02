import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { BankAccount, BankAccountSchema } from './schemas/bank-account.schema'
import { BankAccountsController } from './bank-accounts.controller'
import { BankAccountsService } from './bank-accounts.service'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BankAccount.name, schema: BankAccountSchema }]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [BankAccountsController],
  providers: [BankAccountsService],
  exports: [MongooseModule, BankAccountsService],
})
export class BankAccountsModule {}
