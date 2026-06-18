import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { GroupService } from './group.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('groups')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @Get()
  async getGroups(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('type') type?: string,
  ) {
    return this.groupService.getGroups({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      sort: sort as any,
      type: type as any,
    });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyGroups(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.groupService.getGroups({
      userId: req.user.id,
      type: 'my',
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':slug')
  async getGroup(
    @Param('slug') slug: string,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.groupService.getGroupBySlug(slug, userId);
  }

  @Get(':slug/topics')
  @UseGuards(JwtAuthGuard)
  async getGroupTopics(
    @Param('slug') slug: string,
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const group = await this.groupService.getGroupBySlug(slug);
    return this.groupService.getGroupTopics(
      group.id,
      req.user.id,
      {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
      }
    );
  }

  @Get(':slug/members/pending')
  @UseGuards(JwtAuthGuard)
  async getPendingMembers(
    @Param('slug') slug: string,
    @Request() req: any,
  ) {
    const group = await this.groupService.getGroupBySlug(slug);
    return this.groupService.getPendingMembers(group.id, req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createGroup(
    @Body() body: {
      name: string;
      slug: string;
      description?: string;
      coverImage?: string;
      icon?: string;
      isPrivate?: boolean;
      requiresApproval?: boolean;
    },
    @Request() req: any,
  ) {
    return this.groupService.createGroup(req.user.id, body);
  }

  @Post(':slug/join')
  @UseGuards(JwtAuthGuard)
  async joinGroup(
    @Param('slug') slug: string,
    @Request() req: any,
  ) {
    const group = await this.groupService.getGroupBySlug(slug);
    return this.groupService.joinGroup(group.id, req.user.id);
  }

  @Post(':slug/leave')
  @UseGuards(JwtAuthGuard)
  async leaveGroup(
    @Param('slug') slug: string,
    @Request() req: any,
  ) {
    const group = await this.groupService.getGroupBySlug(slug);
    return this.groupService.leaveGroup(group.id, req.user.id);
  }

  @Post(':slug/members/:userId/approve')
  @UseGuards(JwtAuthGuard)
  async approveMember(
    @Param('slug') slug: string,
    @Param('userId') targetUserId: string,
    @Request() req: any,
  ) {
    const group = await this.groupService.getGroupBySlug(slug);
    return this.groupService.approveMember(group.id, req.user.id, targetUserId);
  }

  @Post(':slug/members/:userId/role')
  @UseGuards(JwtAuthGuard)
  async updateMemberRole(
    @Param('slug') slug: string,
    @Param('userId') targetUserId: string,
    @Body() body: { role: 'MODERATOR' | 'MEMBER' },
    @Request() req: any,
  ) {
    const group = await this.groupService.getGroupBySlug(slug);
    return this.groupService.updateMemberRole(group.id, req.user.id, targetUserId, body.role);
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard)
  async updateGroup(
    @Param('slug') slug: string,
    @Body() body: {
      name?: string;
      description?: string;
      coverImage?: string;
      icon?: string;
      isPrivate?: boolean;
      requiresApproval?: boolean;
    },
    @Request() req: any,
  ) {
    const group = await this.groupService.getGroupBySlug(slug);
    return this.groupService.updateGroup(group.id, req.user.id, body);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  async deleteGroup(
    @Param('slug') slug: string,
    @Request() req: any,
  ) {
    const group = await this.groupService.getGroupBySlug(slug);
    return this.groupService.deleteGroup(group.id, req.user.id);
  }
}
