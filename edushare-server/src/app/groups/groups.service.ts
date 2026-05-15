import { Injectable, NotFoundException } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectModel } from '@nestjs/mongoose'
import { Model, QueryFilter, Types } from 'mongoose'
import { Group, GroupDocument, GroupStatus } from './entities/group.entity'
import { CreateGroupDto } from './dto/create-group.dto'
import { UpdateGroupDto } from './dto/update-group.dto'

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name)
    private readonly groupModel: Model<GroupDocument>,
  ) {}

  private calculateStatus(params: { occupiedSlots: number; totalSlots: number; expiredAt: Date | null }): GroupStatus {
    const { occupiedSlots, totalSlots, expiredAt } = params
    const now = new Date()
    if (expiredAt && expiredAt <= now) return GroupStatus.EXPIRED
    if (occupiedSlots >= totalSlots) return GroupStatus.FULL
    return GroupStatus.AVAILABLE
  }

  private async syncStatus(group: GroupDocument): Promise<GroupDocument> {
    const nextStatus = this.calculateStatus({
      occupiedSlots: group.occupiedSlots,

      totalSlots: group.totalSlots,

      expiredAt: group.expiredAt ?? null,
    })

    if (group.status === nextStatus) {
      return group
    }

    group.status = nextStatus

    return group.save()
  }

  async create(createGroupDto: CreateGroupDto, userId: string) {
    const createdGroup = new this.groupModel({
      ...createGroupDto,
      occupiedSlots: 0,
      members: [],
      ownerId: new Types.ObjectId(userId),
      status: GroupStatus.AVAILABLE,
    })
    const data = await createdGroup.save()
    return {
      message: 'Group created successfully',
      data,
    }
  }

  async findAll(): Promise<{ message: string; data: GroupDocument[] }> {
    return {
      message: 'Groups retrieved successfully',
      data: await this.groupModel
        .find()
        .populate('ownerId', 'id email displayName')
        .populate('members', 'id email displayName')
        .exec(),
    }
  }

  async findOne(filter: QueryFilter<GroupDocument>): Promise<GroupDocument> {
    const group = await this.groupModel
      .findOne(filter)
      .populate('ownerId', 'id email displayName')
      .populate('members', 'id email displayName')
      .exec()

    if (!group) {
      throw new NotFoundException('Group not found')
    }

    return group
  }

  async update(id: object, updateGroupDto: UpdateGroupDto) {
    const updatedGroup = await this.groupModel
      .findByIdAndUpdate(id, updateGroupDto, { new: true, runValidators: true })
      .exec()

    if (!updatedGroup) {
      throw new NotFoundException('Group not found')
    }

    const data = await this.syncStatus(updatedGroup)
    return {
      message: 'Group updated successfully',
      data,
    }
  }

  async remove(id: object) {
    const deletedGroup = await this.groupModel.findByIdAndDelete(id).exec()

    if (!deletedGroup) {
      throw new NotFoundException('Group not found')
    }

    return {
      message: 'Group deleted successfully',
      data: deletedGroup,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Cron(CronExpression.EVERY_MINUTE)
  async markExpiredGroups(): Promise<void> {
    const now = new Date()
    await this.groupModel.updateMany(
      {
        expiredAt: { $ne: null, $lte: now },
        status: { $ne: GroupStatus.EXPIRED },
      },
      { $set: { status: GroupStatus.EXPIRED } },
    )
  }
}
