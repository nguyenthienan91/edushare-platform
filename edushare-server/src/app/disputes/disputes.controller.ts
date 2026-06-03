// src/app/disputes/disputes.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  BadRequestException,
  UploadedFiles,
  UseInterceptors,
  Query,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import 'multer'
import { DisputesService } from './disputes.service'
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger'
import { AuthGuard } from '../auth/auth.guard'
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service'
import { CreateDisputeDto, CreateDisputeSwaggerDto } from './dto/create-dispute.dto'
import { SubmitCounterProofSwaggerDto } from './dto/submit-counter-proof.dto'
import { DisputeQueryDto } from './dto/dispute-query.dto'
import { DisputeStatus } from './schemas/dispute.schema'

@ApiTags('Disputes (Tranh chấp & Khiếu nại)')
@UseGuards(AuthGuard)
@Controller('disputes')
export class DisputesController {
  constructor(
    private readonly disputesService: DisputesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: '[MEMBER/OWNER] Lấy danh sách khiếu nại của bản thân (do mình gửi hoặc liên quan đến nhóm của mình)',
  })
  @ApiQuery({ name: 'status', required: false, enum: DisputeStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'itemPerPage', required: false, type: Number })
  async getMyDisputes(@Req() req: any, @Query() query: DisputeQueryDto) {
    const userId = req.user.userID as string
    return await this.disputesService.getMyDisputes(userId, query)
  }

  @Post()
  @ApiOperation({ summary: '[MEMBER] Khởi tạo đơn khiếu nại đóng băng giao dịch mua slot' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateDisputeSwaggerDto })
  @UseInterceptors(FilesInterceptor('files', 5))
  async create(@Req() req: any, @Body() dto: CreateDisputeDto, @UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one evidence image is required.')
    }
    const userId = req.user.userID as string
    try {
      const uploadResults = await Promise.all(files.map((f) => this.cloudinaryService.uploadImage(f)))
      const memberEvidence = uploadResults.map((r) => r.secure_url)
      return await this.disputesService.createDispute(userId, dto.transactionId, dto.reason, memberEvidence)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new BadRequestException('Failed to upload evidence images: ' + message)
    }
  }

  @Patch(':id/counter-proof')
  @ApiOperation({ summary: '[OWNER] Chủ nhóm nộp ảnh bằng chứng đối chất phản biện' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SubmitCounterProofSwaggerDto })
  @UseInterceptors(FilesInterceptor('files', 5))
  async counterProof(@Req() req: any, @Param('id') id: string, @UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one counter-evidence image is required.')
    }
    const userId = req.user.userID as string
    try {
      const uploadResults = await Promise.all(files.map((f) => this.cloudinaryService.uploadImage(f)))
      const ownerEvidence = uploadResults.map((r) => r.secure_url)
      return await this.disputesService.submitCounterProof(userId, id, ownerEvidence)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new BadRequestException('Failed to upload counter-evidence images: ' + message)
    }
  }
}
