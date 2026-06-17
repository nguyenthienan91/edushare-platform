import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { BankAccount, BankAccountDocument } from './schemas/bank-account.schema'
import { CreateBankAccountDto } from './dto/create-bank-account.dto'
import { UpdateBankAccountDto } from './dto/update-bank-account.dto'

@Injectable()
export class BankAccountsService {
  constructor(
    @InjectModel(BankAccount.name)
    private readonly bankAccountModel: Model<BankAccountDocument>,
  ) {}

  async create(userId: string, createBankAccountDto: CreateBankAccountDto): Promise<BankAccountDocument> {
    const userObjectId = new Types.ObjectId(userId)

    // Check current bank account limit
    const count = await this.bankAccountModel.countDocuments({ userId: userObjectId }).exec()
    if (count >= 3) {
      throw new BadRequestException('You can only save up to 3 bank accounts.')
    }

    const isFirstAccount = count === 0
    const setAsDefault = isFirstAccount || !!createBankAccountDto.isDefault

    // If setting as default, update all existing accounts to not be default
    if (setAsDefault) {
      await this.bankAccountModel.updateMany({ userId: userObjectId }, { isDefault: false }).exec()
    }

    const bankAccount = await this.bankAccountModel.create({
      ...createBankAccountDto,
      userId: userObjectId,
      isDefault: setAsDefault,
    })

    return bankAccount
  }

  async findAll(userId: string): Promise<BankAccountDocument[]> {
    const userObjectId = new Types.ObjectId(userId)
    return await this.bankAccountModel.find({ userId: userObjectId }).sort({ isDefault: -1, createdAt: -1 }).exec()
  }

  async findOne(userId: string, id: string): Promise<BankAccountDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid bank account ID.')
    }
    const bankAccount = await this.bankAccountModel.findById(id).exec()
    if (!bankAccount || bankAccount.userId.toString() !== userId) {
      throw new NotFoundException('Bank account not found.')
    }
    return bankAccount
  }

  async update(userId: string, id: string, updateBankAccountDto: UpdateBankAccountDto): Promise<BankAccountDocument> {
    const bankAccount = await this.findOne(userId, id)
    const userObjectId = new Types.ObjectId(userId)

    const isDefaultUpdating = updateBankAccountDto.isDefault

    if (isDefaultUpdating === true) {
      // Set all other accounts to not default
      await this.bankAccountModel
        .updateMany({ userId: userObjectId, _id: { $ne: bankAccount._id } }, { isDefault: false })
        .exec()
    } else if (isDefaultUpdating === false && bankAccount.isDefault) {
      // User is setting default to false on the current default account, set another account to default
      const anotherAccount = await this.bankAccountModel
        .findOne({ userId: userObjectId, _id: { $ne: bankAccount._id } })
        .exec()
      if (anotherAccount) {
        anotherAccount.isDefault = true
        await anotherAccount.save()
      } else {
        // If it's the only account, force it to stay default
        updateBankAccountDto.isDefault = true
      }
    }

    const updatedAccount = await this.bankAccountModel
      .findByIdAndUpdate(id, { $set: updateBankAccountDto }, { new: true })
      .exec()

    if (!updatedAccount) {
      throw new NotFoundException('Bank account not found.')
    }

    return updatedAccount
  }

  async remove(userId: string, id: string) {
    const bankAccount = await this.findOne(userId, id)
    const userObjectId = new Types.ObjectId(userId)

    await this.bankAccountModel.findByIdAndDelete(id).exec()

    // If the deleted account was default, set another account as default if it exists
    if (bankAccount.isDefault) {
      const anotherAccount = await this.bankAccountModel.findOne({ userId: userObjectId }).exec()
      if (anotherAccount) {
        anotherAccount.isDefault = true
        await anotherAccount.save()
      }
    }

    return {
      message: 'Bank account deleted successfully.',
    }
  }
}
