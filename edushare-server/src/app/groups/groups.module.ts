import { Module } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { GroupsController } from './groups.controller'
import { Group, GroupSchema } from './entities/group.entity'
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module'

@Module({
  imports: [MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }])],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
