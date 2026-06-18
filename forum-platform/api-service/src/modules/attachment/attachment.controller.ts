import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AttachmentService } from './attachment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('attachments')
export class AttachmentController {
  constructor(private attachmentService: AttachmentService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    return this.attachmentService.upload(file, req.user.id);
  }

  @Post('upload/multiple')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
  ) {
    return this.attachmentService.uploadMultiple(files, req.user.id);
  }

  @Get(':id')
  async getAttachment(@Param('id') id: string) {
    return this.attachmentService.getAttachment(id);
  }

  @Get('topic/:topicId')
  async getTopicAttachments(@Param('topicId') topicId: string) {
    return this.attachmentService.getAttachments('topic', topicId);
  }

  @Get('post/:postId')
  async getPostAttachments(@Param('postId') postId: string) {
    return this.attachmentService.getAttachments('post', postId);
  }

  @Post('topic/:topicId/:attachmentId')
  @UseGuards(JwtAuthGuard)
  async attachToTopic(
    @Param('topicId') topicId: string,
    @Param('attachmentId') attachmentId: string,
    @Request() req: any,
  ) {
    return this.attachmentService.attachToTopic(attachmentId, topicId, req.user.id);
  }

  @Post('post/:postId/:attachmentId')
  @UseGuards(JwtAuthGuard)
  async attachToPost(
    @Param('postId') postId: string,
    @Param('attachmentId') attachmentId: string,
    @Request() req: any,
  ) {
    return this.attachmentService.attachToPost(attachmentId, postId, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.attachmentService.delete(id, req.user.id);
  }

  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  async getMyAttachments(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.attachmentService.getUserAttachments(req.user.id, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('user/me/stats')
  @UseGuards(JwtAuthGuard)
  async getMyStats(@Request() req: any) {
    return this.attachmentService.getStats(req.user.id);
  }
}
