import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { AuthGuard } from './auth/auth.guard'
import { RolesGuard } from '../common/security/roles/roles.guard'
import { GroupsModule } from './groups/groups.module'
import { ScheduleModule } from '@nestjs/schedule'
import { WalletsModule } from './wallets/wallets.module'
import { TransactionsModule } from './transactions/transactions.module'
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module'
import { RatingsModule } from './ratings/ratings.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // eslint-disable-next-line @typescript-eslint/require-await
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    AuthModule,
    UsersModule,
    GroupsModule,
    WalletsModule,
    TransactionsModule,
    PaymentGatewayModule,
    RatingsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: AuthGuard }, { provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule {}
