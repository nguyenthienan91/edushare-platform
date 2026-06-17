// src/app/transactions/transactions.controller.ts
import {
  BadRequestException,
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Patch,
  Param,
  UploadedFile,
  UseInterceptors,
  Get,
  Query,
  ForbiddenException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import 'multer'
import { TransactionsService } from './transactions.service'
import { AuthGuard } from '../auth/auth.guard'
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { JoinRequestDto } from './dto/join-request.dto'
import { AdminTransactionQueryDto } from './dto/admin-transaction-query.dto'
import { ParseParamsPaginationPipe } from '../../common/pipes/parse-params-pagination.pipe'
import { Pagination } from '../../common/utils/pagination-util/pagination-util.interface'

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // API để Member bấm "Join nhóm" -> Hệ thống tự động trích tiền từ ví và đóng băng
  @Post('join-request')
  async requestJoin(@Req() req: any, @Body() joinRequestDto: JoinRequestDto) {
    const userId = req.user.userID // Lấy ID người mua từ JWT token
    return await this.transactionsService.requestJoinGroup(userId, joinRequestDto.groupId)
  }

  /**
   * API Chủ nhóm nộp minh chứng: Tiếp nhận file hình ảnh từ Client gửi lên
   */
  @Patch(':id/submit-proof')
  @ApiConsumes('multipart/form-data') // 1. Báo cho Swagger biết API này nhận dữ liệu dạng File Form-data
  @ApiBody({
    // 2. Định nghĩa cấu trúc Body để Swagger render ra ô chọn file
    schema: {
      type: 'object',
      properties: {
        file: {
          // Key này phải trùng với tên trong FileInterceptor('file')
          type: 'string',
          format: 'binary', // Định dạng 'binary' sẽ biến ô nhập text thành nút chọn File
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file')) // 'file' chính là cái key/field-name mà Frontend phải đặt trong FormData
  async ownerSubmitProof(
    @Param('id') transactionId: string,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File, // Bắt lấy file ảnh từ request
  ) {
    // 1. Kiểm tra xem người dùng có thực sự gửi file lên không
    if (!file) {
      throw new BadRequestException('Please upload a proof image.')
    }

    const ownerId = req.user.userID // Lấy ID chủ nhóm từ JWT Token công khai

    try {
      // 2. Tiến hành đẩy file lên đám mây Cloudinary trước
      const uploadResult = await this.cloudinaryService.uploadImage(file)

      // Lấy đường dẫn ảnh dạng HTTPS bảo mật do Cloudinary trả về
      const secureProofUrl = uploadResult.secure_url

      // 3. Đã có link ảnh an toàn, giờ mới ném vào Service để chạy lệnh lưu DB
      return await this.transactionsService.submitProof(transactionId, ownerId, secureProofUrl)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new BadRequestException('Failed to upload image to Cloudinary: ' + message)
    }
  }

  @Post(':id/confirm')
  @UseGuards(AuthGuard)
  async memberConfirm(@Param('id') transactionId: string, @Req() req: any) {
    const memberId = req.user.userID // ID của người mua
    return await this.transactionsService.confirmTransaction(transactionId, memberId)
  }

  @Post(':id/approve')
  @UseGuards(AuthGuard)
  async ownerApproveMember(@Param('id') transactionId: string, @Req() req: any) {
    const ownerId = req.user.userID // Lấy ID chủ nhóm từ Token
    return await this.transactionsService.approveJoinRequest(transactionId, ownerId)
  }

  @Get('me')
  @ApiOperation({ summary: 'Xem danh sách giao dịch do user đang đăng nhập tạo' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công.' })
  async getMyTransactions(@Req() req: any, @Query(new ParseParamsPaginationPipe()) pagination: Pagination) {
    const userId = req.user.userID
    return await this.transactionsService.findMyTransactions(userId, pagination)
  }

  @Get()
  @ApiOperation({ summary: '[ADMIN] Xem danh sách toàn bộ giao dịch và minh chứng ảnh' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công.' })
  @ApiResponse({ status: 403, description: 'Quyền truy cập bị từ chối - Bạn không phải Admin.' })
  async getTransactionsForAdmin(
    @Req() req: any,
    @Query() query: AdminTransactionQueryDto, // Hứng bộ lọc status từ URL query string
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Access denied. This feature is restricted to administrators only.')
    }

    // Nếu qua được màng lọc, tiến hành gọi service
    return await this.transactionsService.findAllTransactionsForAdmin(query)
  }
}
