import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Group, GroupDocument, GroupStatus } from './entities/group.entity'
import { CreateGroupDto } from './dto/create-group.dto'
import { UpdateGroupDto } from './dto/update-group.dto'
import { UsersService } from '../users/users.service'
import type { UserDocument } from '../users/entities/user.entity'

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name)
    private readonly groupModel: Model<Group>,
    private readonly usersService: UsersService,
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

  private ensurePaymentActive(user: UserDocument) {
    if (!user.isSubscriptionActive) {
      throw new BadRequestException('Payment required')
    }

    if (user.membershipExpiresAt && user.membershipExpiresAt <= new Date()) {
      throw new BadRequestException('Membership expired')
    }
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

  async findOne(filter: Record<string, unknown>): Promise<GroupDocument> {
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

  async joinGroup(groupId: string, userId: string) {
    const user = await this.usersService.findById(userId)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    this.ensurePaymentActive(user)

    const userObjectId = new Types.ObjectId(userId)
    const groupObjectId = new Types.ObjectId(groupId)
    const now = new Date()
    const joinFilter: Record<string, unknown> = {
      _id: groupObjectId,
      members: { $ne: userObjectId },
      $expr: { $lt: ['$occupiedSlots', '$totalSlots'] },
      $or: [{ expiredAt: null }, { expiredAt: { $gt: now } }],
    }

    const joinResult = await this.groupModel
      .updateOne(joinFilter, {
        $addToSet: { members: userObjectId },
        $inc: { occupiedSlots: 1 },
      })
      .exec()

    if (joinResult.modifiedCount !== 1) {
      console.log('groupId:', groupId, 'userId:', userId)
      const group = await this.groupModel.findById(groupId).exec()
      if (!group) {
        throw new NotFoundException('Group not found')
      }

      const currentStatus = this.calculateStatus({
        occupiedSlots: group.occupiedSlots,
        totalSlots: group.totalSlots,
        expiredAt: group.expiredAt ?? null,
      })

      if (currentStatus === GroupStatus.EXPIRED) {
        throw new BadRequestException('Group expired')
      }

      if (group.occupiedSlots >= group.totalSlots) {
        throw new BadRequestException('Group is full')
      }

      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const alreadyMember = group.members.some((memberId) => memberId.toString() === userObjectId.toString())
      if (alreadyMember) {
        throw new BadRequestException('Already joined this group')
      }

      throw new BadRequestException('Unable to join group')
    }

    const updatedGroup = await this.groupModel.findById(groupObjectId).exec()
    if (!updatedGroup) {
      throw new NotFoundException('Group not found')
    }

    const data = await this.syncStatus(updatedGroup)

    return {
      message: 'Joined group successfully',
      data,
    }
  }

  async removeMember(groupId: string, userId: string) {
    const userObjectId = new Types.ObjectId(userId)
    const groupObjectId = new Types.ObjectId(groupId)
    const removeFilter: Record<string, unknown> = {
      _id: groupObjectId,
      members: userObjectId,
      occupiedSlots: { $gt: 0 },
    }

    const removeResult = await this.groupModel
      .updateOne(removeFilter, {
        $pull: { members: userObjectId },
        $inc: { occupiedSlots: -1 },
      })
      .exec()

    if (removeResult.modifiedCount !== 1) {
      const group = await this.groupModel.findById(groupId).exec()
      if (!group) {
        throw new NotFoundException('Group not found')
      }

      throw new BadRequestException('User is not a member of this group')
    }

    const updatedGroup = await this.groupModel.findById(groupObjectId).exec()
    if (!updatedGroup) {
      throw new NotFoundException('Group not found')
    }

    const data = await this.syncStatus(updatedGroup)

    return {
      message: 'Member removed successfully',
      data,
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
