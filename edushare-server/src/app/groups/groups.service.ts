import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Group, GroupCategory, GroupDocument, GroupStatus } from './entities/group.entity'
import { CreateGroupDto } from './dto/create-group.dto'
import { UpdateGroupDto } from './dto/update-group.dto'
import { UsersService } from '../users/users.service'
import type { UserDocument } from '../users/entities/user.entity'
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service'
import { Pagination } from '../../common/utils/pagination-util/pagination-util.interface'

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name)
    private readonly groupModel: Model<Group>,
    private readonly usersService: UsersService,
    private readonly paginationUtilService: PaginationUtilService,
  ) {}

  private calculateStatus(params: { occupiedSlots: number; totalSlots: number; expiredAt: Date | null }): GroupStatus {
    const { occupiedSlots, totalSlots, expiredAt } = params
    const now = new Date()
    if (expiredAt && expiredAt <= now) return GroupStatus.EXPIRED
    if (occupiedSlots >= totalSlots) return GroupStatus.FULL
    return GroupStatus.AVAILABLE
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  private normalizeQueryValue(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
      return value[0]
    }
    return value
  }

  private buildSearchFilter(query: Record<string, string | string[] | undefined>): Record<string, unknown> {
    const filter: Record<string, unknown> = {}
    let hasFilter = false

    const setFilter = (key: string, value: unknown) => {
      filter[key] = value
      hasFilter = true
    }

    const parseText = (value: string, field: string) => {
      const trimmed = value.trim()
      if (!trimmed) {
        throw new BadRequestException(`${field} is required`)
      }
      setFilter(field, new RegExp(this.escapeRegex(trimmed), 'i'))
    }

    const parseEnum = (value: string, field: string, allowed: readonly string[]) => {
      if (!allowed.includes(value)) {
        throw new BadRequestException(`${field} is invalid`)
      }
      setFilter(field, value)
    }

    const parseNumber = (value: string, field: string) => {
      const parsed = Number(value)
      if (!Number.isFinite(parsed)) {
        throw new BadRequestException(`${field} must be a number`)
      }
      setFilter(field, parsed)
    }

    const parseObjectId = (value: string, field: string) => {
      if (!Types.ObjectId.isValid(value)) {
        throw new BadRequestException(`${field} is invalid`)
      }
      setFilter(field, new Types.ObjectId(value))
    }

    const parseDate = (value: string, field: string) => {
      const parsed = new Date(value)
      if (Number.isNaN(parsed.getTime())) {
        throw new BadRequestException(`${field} is invalid`)
      }
      setFilter(field, parsed)
    }

    const name = this.normalizeQueryValue(query.name)
    if (name !== undefined) {
      parseText(name, 'name')
    }

    const description = this.normalizeQueryValue(query.description)
    if (description !== undefined) {
      parseText(description, 'description')
    }

    const category = this.normalizeQueryValue(query.category)
    if (category !== undefined) {
      parseEnum(category, 'category', Object.values(GroupCategory))
    }

    const status = this.normalizeQueryValue(query.status)
    if (status !== undefined) {
      parseEnum(status, 'status', Object.values(GroupStatus))
    }

    const ownerId = this.normalizeQueryValue(query.ownerId)
    if (ownerId !== undefined) {
      parseObjectId(ownerId, 'ownerId')
    }

    const members = this.normalizeQueryValue(query.members)
    if (members !== undefined) {
      parseObjectId(members, 'members')
    }

    const totalSlots = this.normalizeQueryValue(query.totalSlots)
    if (totalSlots !== undefined) {
      parseNumber(totalSlots, 'totalSlots')
    }

    const occupiedSlots = this.normalizeQueryValue(query.occupiedSlots)
    if (occupiedSlots !== undefined) {
      parseNumber(occupiedSlots, 'occupiedSlots')
    }

    const totalPrice = this.normalizeQueryValue(query.totalPrice)
    if (totalPrice !== undefined) {
      parseNumber(totalPrice, 'totalPrice')
    }

    const price = this.normalizeQueryValue(query.price)
    if (price !== undefined) {
      parseNumber(price, 'price')
    }

    const expiredAt = this.normalizeQueryValue(query.expiredAt)
    if (expiredAt !== undefined) {
      parseDate(expiredAt, 'expiredAt')
    }

    if (!hasFilter) {
      throw new BadRequestException('At least one filter is required')
    }

    return filter
  }

  private async syncStatus(group: GroupDocument): Promise<GroupDocument> {
    if (group.status === GroupStatus.CLOSED || group.status === GroupStatus.HIDDEN) {
      return group
    }

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
      price: createGroupDto.totalPrice / createGroupDto.totalSlots,
      ownerId: new Types.ObjectId(userId),
      status: GroupStatus.AVAILABLE,
    })
    const data = await createdGroup.save()
    return {
      message: 'Group created successfully',
      data,
    }
  }

  async findAll(pagination: Pagination) {
    const totalItems = await this.groupModel.countDocuments().exec()
    const paging = this.paginationUtilService.paging({
      page: pagination.page,
      itemPerPage: pagination.itemPerPage,
      totalItems,
    })

    const data = await this.groupModel
      .find()
      .skip(paging.skip)
      .limit(paging.itemPerPage)
      .populate('ownerId', 'id email displayName')
      .populate('members', 'id email displayName')
      .exec()

    return {
      message: 'Groups retrieved successfully',
      data: await this.groupModel
        .find()
        .sort({ 'ownerId.trustScore': -1 })
        .populate('ownerId', 'username displayName avatar trustScore')
        .populate('members', 'id email displayName')
        .exec(),
      ...this.paginationUtilService.format(data),
    }
  }

  async sortByPrice(order: 'asc' | 'desc' = 'asc', pagination: Pagination) {
    if (order !== 'asc' && order !== 'desc') {
      throw new BadRequestException('order must be asc or desc')
    }

    const direction = order === 'desc' ? -1 : 1
    const totalItems = await this.groupModel.countDocuments().exec()
    const paging = this.paginationUtilService.paging({
      page: pagination.page,
      itemPerPage: pagination.itemPerPage,
      totalItems,
    })

    const data = await this.groupModel
      .find()
      .sort({ price: direction })
      .skip(paging.skip)
      .limit(paging.itemPerPage)
      .populate('ownerId', 'id email displayName')
      .populate('members', 'id email displayName')
      .exec()

    return {
      message: 'Groups retrieved successfully',
      data: await this.groupModel
        .find()
        .sort({ price: direction, 'ownerId.trustScore': -1, createdAt: -1 })
        .populate('ownerId', 'username displayName avatar trustScore')
        .populate('members', 'id email displayName')
        .exec(),
      ...this.paginationUtilService.format(data),
    }
  }

  async search(query: Record<string, string | string[] | undefined>, pagination: Pagination) {
    const filter = this.buildSearchFilter(query)
    const totalItems = await this.groupModel.countDocuments(filter).exec()
    const paging = this.paginationUtilService.paging({
      page: pagination.page,
      itemPerPage: pagination.itemPerPage,
      totalItems,
    })

    const data = await this.groupModel
      .find(filter)
      .skip(paging.skip)
      .limit(paging.itemPerPage)
      .populate('ownerId', 'id email displayName')
      .populate('members', 'id email displayName')
      .exec()

    return {
      message: 'Groups retrieved successfully',
      data: await this.groupModel
        .find(filter)
        .sort({ 'ownerId.trustScore': -1, createdAt: -1 })
        .populate('ownerId', 'username displayName avatar trustScore')
        .populate('members', 'id email displayName')
        .exec(),
      ...this.paginationUtilService.format(data),
    }
  }

  async findOne(filter: Record<string, unknown>): Promise<GroupDocument> {
    const group = await this.groupModel
      .findOne(filter)
      .populate('ownerId', 'username displayName avatar trustScore')
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
      status: GroupStatus.AVAILABLE,
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

      if (group.status === GroupStatus.CLOSED) {
        throw new BadRequestException('Group is closed')
      }

      if (group.status === GroupStatus.HIDDEN) {
        throw new BadRequestException('Group is hidden')
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

  @Cron(CronExpression.EVERY_MINUTE)
  async markExpiredGroups(): Promise<void> {
    const now = new Date()
    await this.groupModel.updateMany(
      {
        expiredAt: { $ne: null, $lte: now },
        status: { $nin: [GroupStatus.EXPIRED, GroupStatus.CLOSED, GroupStatus.HIDDEN] },
      },
      { $set: { status: GroupStatus.EXPIRED } },
    )
  }

  async updateStatusAdmin(groupId: string, status: GroupStatus): Promise<{ message: string; data: GroupDocument }> {
    if (status !== GroupStatus.CLOSED && status !== GroupStatus.HIDDEN) {
      throw new BadRequestException('Status must be closed or hidden')
    }

    const group = await this.groupModel.findById(groupId).exec()

    if (!group) {
      throw new NotFoundException('Group not found')
    }

    if (group.status !== GroupStatus.CLOSED && group.status !== GroupStatus.HIDDEN) {
      group.adminStatusBeforeLock = group.status
    }

    group.status = status
    const updatedGroup = await group.save()

    return {
      message: 'Group status updated successfully',
      data: updatedGroup,
    }
  }

  async restoreStatusAdmin(groupId: string): Promise<{ message: string; data: GroupDocument }> {
    const group = await this.groupModel.findById(groupId).exec()

    if (!group) {
      throw new NotFoundException('Group not found')
    }

    if (group.status !== GroupStatus.CLOSED && group.status !== GroupStatus.HIDDEN) {
      throw new BadRequestException('Group is not closed or hidden')
    }

    const previousStatus = group.adminStatusBeforeLock
    const nextStatus =
      previousStatus && previousStatus !== GroupStatus.CLOSED && previousStatus !== GroupStatus.HIDDEN
        ? previousStatus
        : this.calculateStatus({
            occupiedSlots: group.occupiedSlots,
            totalSlots: group.totalSlots,
            expiredAt: group.expiredAt ?? null,
          })

    group.status = nextStatus
    group.adminStatusBeforeLock = null
    const updatedGroup = await group.save()

    return {
      message: 'Group status restored successfully',
      data: updatedGroup,
    }
  }

  async getDashboardStats(ownerId: string): Promise<{ totalMembers: number }> {
    const groups = await this.groupModel
      .find({ ownerId } as any)
      .select('members')
      .exec()
    const totalMembers = groups.reduce((sum, group) => sum + (group.members?.length || 0), 0)
    return { totalMembers }
  }
}
