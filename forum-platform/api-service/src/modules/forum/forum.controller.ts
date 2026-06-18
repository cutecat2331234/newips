import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ForumService } from './forum.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('forums')
export class ForumController {
  constructor(private forumService: ForumService) {}

  @Get('categories')
  async getCategories() {
    return this.forumService.getCategories();
  }

  @Get('categories/:slug')
  async getCategoryBySlug(@Param('slug') slug: string) {
    return this.forumService.getCategoryBySlug(slug);
  }

  @Post('topics')
  @UseGuards(JwtAuthGuard)
  async createTopic(@Body() createTopicDto: CreateTopicDto, @GetUser() user: { userId: string }) {
    return this.forumService.createTopic(createTopicDto, user.userId);
  }

  @Get('topics/:id')
  async getTopicById(@Param('id') id: string) {
    return this.forumService.getTopicById(id);
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  async createPost(@Body() createPostDto: CreatePostDto, @GetUser() user: { userId: string }) {
    return this.forumService.createPost(createPostDto, user.userId);
  }

  @Get('tags')
  async getTags() {
    return this.forumService.getTags();
  }
}