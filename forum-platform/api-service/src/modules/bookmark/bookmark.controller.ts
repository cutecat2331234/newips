import { Controller, Get, Post, Delete, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @Get()
  async getUserBookmarks(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.bookmarkService.getUserBookmarks(req.user.id, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      categoryId,
    });
  }

  @Post(':topicId')
  async addBookmark(
    @Param('topicId') topicId: string,
    @Body() body: { note?: string },
    @Request() req: any,
  ) {
    return this.bookmarkService.addBookmark(req.user.id, topicId, body.note);
  }

  @Delete(':topicId')
  async removeBookmark(
    @Param('topicId') topicId: string,
    @Request() req: any,
  ) {
    return this.bookmarkService.removeBookmark(req.user.id, topicId);
  }

  @Patch(':topicId')
  async updateBookmarkNote(
    @Param('topicId') topicId: string,
    @Body() body: { note: string },
    @Request() req: any,
  ) {
    return this.bookmarkService.updateBookmarkNote(req.user.id, topicId, body.note);
  }

  @Get(':topicId/status')
  async isBookmarked(
    @Param('topicId') topicId: string,
    @Request() req: any,
  ) {
    return { isBookmarked: await this.bookmarkService.isBookmarked(req.user.id, topicId) };
  }

  @Get('stats/count')
  async getBookmarkCount(@Request() req: any) {
    return { count: await this.bookmarkService.getBookmarkCount(req.user.id) };
  }
}
