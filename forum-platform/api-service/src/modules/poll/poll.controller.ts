import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PollService } from './poll.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('polls')
export class PollController {
  constructor(private pollService: PollService) {}

  @Get('topic/:topicId')
  async getPollByTopicId(
    @Param('topicId') topicId: string,
    @Request() req: any
  ) {
    const userId = req.user?.id;
    return this.pollService.getPollByTopicId(topicId, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPoll(
    @Body() body: {
      topicId: string;
      question: string;
      options: string[];
      allowMultiple?: boolean;
      maxChoices?: number;
      showResults?: string;
      endsAt?: Date;
    },
    @Request() req: any
  ) {
    return this.pollService.createPoll(
      body.topicId,
      body.question,
      body.options,
      req.user.id,
      {
        allowMultiple: body.allowMultiple,
        maxChoices: body.maxChoices,
        showResults: body.showResults as any,
        endsAt: body.endsAt,
      }
    );
  }

  @Post(':pollId/vote')
  @UseGuards(JwtAuthGuard)
  async vote(
    @Param('pollId') pollId: string,
    @Body() body: { optionIds: string[] },
    @Request() req: any
  ) {
    return this.pollService.vote(pollId, body.optionIds, req.user.id);
  }

  @Patch(':pollId/vote')
  @UseGuards(JwtAuthGuard)
  async changeVote(
    @Param('pollId') pollId: string,
    @Body() body: { optionIds: string[] },
    @Request() req: any
  ) {
    return this.pollService.changeVote(pollId, body.optionIds, req.user.id);
  }

  @Patch(':pollId/close')
  @UseGuards(JwtAuthGuard)
  async closePoll(
    @Param('pollId') pollId: string,
    @Request() req: any
  ) {
    return this.pollService.closePoll(pollId, req.user.id);
  }

  @Get(':pollId/stats')
  async getPollStats(@Param('pollId') pollId: string) {
    return this.pollService.getPollStats(pollId);
  }
}
