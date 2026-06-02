import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Rating, RatingDocument } from './schemas/rating.schema'
import { Transaction, TransactionDocument } from '../transactions/schemas/transaction.schema'
import { Group, GroupDocument } from '../groups/entities/group.entity'
import { EscrowStatus } from '../transactions/enums/escrow-status.enum'
import { CreateRatingDto } from './dto/create-rating.dto'
import { User, UserDocument } from '../users/entities/user.entity'

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(userId: string, payload: CreateRatingDto) {
    const { transactionId, rating, comment } = payload

    const transaction = await this.transactionModel.findById(transactionId).exec()
    if (!transaction) {
      throw new NotFoundException('Transaction not found.')
    }

    if (transaction.status !== EscrowStatus.COMPLETED) {
      throw new BadRequestException('Transaction is not completed yet.')
    }

    const senderObjectId = transaction.senderId
    if (!senderObjectId.equals(new Types.ObjectId(userId))) {
      throw new BadRequestException('You are not the buyer of this transaction.')
    }

    const existingRating = await this.ratingModel.findOne({ transactionId: transaction._id }).exec()
    if (existingRating) {
      throw new BadRequestException('This transaction has already been rated.')
    }

    const group = await this.groupModel.findById(transaction.groupId).exec()
    if (!group) {
      throw new NotFoundException('Group not found.')
    }

    const ownerObjectId = new Types.ObjectId(group.ownerId as unknown as string)

    const normalizedComment = comment?.trim()

    const createdRating = await this.ratingModel.create({
      senderId: senderObjectId,
      receiverId: ownerObjectId,
      transactionId: transaction._id,
      rating,
      comment: normalizedComment && normalizedComment.length > 0 ? normalizedComment : null,
    })

    type RatingAggregate = {
      _id: Types.ObjectId
      averageRating: number
    }

    const ratingStats = await this.ratingModel
      .aggregate<RatingAggregate>([
        { $match: { receiverId: ownerObjectId } },
        { $group: { _id: '$receiverId', averageRating: { $avg: '$rating' } } },
      ])
      .exec()

    const averageRating = ratingStats[0]?.averageRating
    if (averageRating !== undefined) {
      await this.userModel.findByIdAndUpdate(ownerObjectId, { trustScore: averageRating }).exec()
    }

    return {
      message: 'Rating submitted successfully.',
      data: createdRating,
    }
  }

  async findAll(query: { senderId?: string; receiverId?: string }) {
    const filter: any = {}
    if (query.senderId) {
      filter.senderId = new Types.ObjectId(query.senderId)
    }
    if (query.receiverId) {
      filter.receiverId = new Types.ObjectId(query.receiverId)
    }
    return await this.ratingModel
      .find(filter)
      .populate('senderId', 'username email avatar')
      .populate('receiverId', 'username email avatar')
      .populate({
        path: 'transactionId',
        populate: {
          path: 'groupId',
          select: 'name category status expiredAt',
        },
      })
      .sort({ createdAt: -1 })
      .exec()
  }
}
