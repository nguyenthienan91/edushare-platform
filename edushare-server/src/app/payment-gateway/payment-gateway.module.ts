import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PaymentGatewayService } from './payment-gateway.service'
import { PaymentGatewayController } from './payment-gateway.controller'
import { WalletsModule } from '../wallets/wallets.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [ConfigModule, WalletsModule, AuthModule],
  providers: [PaymentGatewayService],
  controllers: [PaymentGatewayController],
})
export class PaymentGatewayModule {}
