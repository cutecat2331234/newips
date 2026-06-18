import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PollVisibility } from '@prisma/client';

@Injectable()
export class PollService {
  constructor(private prisma: PrismaService) {}

  async createPoll(
    topicId: string,
    question: string,
    options: string[],
    userId: string,
    settings?: {
      allowMultiple?: boolean;
      maxChoices?: number;
      showResults?: PollVisibility;
      endsAt?: Date;
    }
  ) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    if (topic.authorId !== userId) {
      throw new ForbiddenException('Only the topic author can create a poll');
    }

    // Check if poll already exists
    const existingPoll = await this.prisma.poll.findUnique({
      where: { topicId },
    });

    if (existingPoll) {
      throw new BadRequestException('Poll already exists for this topic');
    }

    const poll = await this.prisma.poll.create({
      data: {
        topicId,
        question,
        allowMultiple: settings?.allowMultiple ?? false,
        maxChoices: settings?.maxChoices ?? 1,
        showResults: settings?.showResults ?? PollVisibility.AFTER_VOTE,
        endsAt: settings?.endsAt,
        options: {
          create: options.map((text, index) => ({
            text,
            order: index,
          })),
        },
      },
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return poll;
  }

  async getPollByTopicId(topicId: string, userId?: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { topicId },
      include: {
        options: {
          orderBy: { order: 'asc' },
          include: {
            votes: true,
          },
        },
      },
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    // Check if user has voted
    const userVotes = await this.prisma.pollVote.findMany({
      where: {
        pollId: poll.id,
        userId: userId,
      },
    });

    const hasVoted = userVotes.length > 0;
    const userVotedOptions = userVotes.map(v => v.optionId);

    // Determine visibility
    const canSeeResults = this.canSeeResults(poll, hasVoted, userId);

    return {
      ...poll,
      hasVoted,
      userVotedOptions,
      canSeeResults,
      options: poll.options.map(opt => ({
        ...opt,
        voteCount: canSeeResults ? opt.voteCount : undefined,
        percentage: canSeeResults ? poll.totalVotes > 0 ? (opt.voteCount / poll.totalVotes) * 100 : 0 : undefined,
      })),
    };
  }

  private canSeeResults(poll: any, hasVoted: boolean, userId?: string): boolean {
    const pollEnded = poll.endsAt && new Date() > poll.endsAt;
    const isOwner = userId === poll.topic?.authorId;

    switch (poll.showResults) {
      case PollVisibility.ALWAYS:
        return true;
      case PollVisibility.AFTER_VOTE:
        return hasVoted || pollEnded || isOwner;
      case PollVisibility.AFTER_END:
        return pollEnded || isOwner;
      case PollVisibility.NEVER:
        return isOwner;
      default:
        return hasVoted;
    }
  }

  async vote(pollId: string, optionIds: string[], userId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: true,
      },
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    if (!poll.isActive) {
      throw new BadRequestException('Poll is not active');
    }

    if (poll.endsAt && new Date() > poll.endsAt) {
      throw new BadRequestException('Poll has ended');
    }

    // Check if user already voted
    const existingVotes = await this.prisma.pollVote.findMany({
      where: {
        pollId,
        userId,
      },
    });

    if (existingVotes.length > 0) {
      throw new BadRequestException('You have already voted');
    }

    // Validate options
    const validOptionIds = poll.options.map(o => o.id);
    for (const optionId of optionIds) {
      if (!validOptionIds.includes(optionId)) {
        throw new BadRequestException('Invalid option');
      }
    }

    // Check max choices
    if (optionIds.length > poll.maxChoices) {
      throw new BadRequestException(`Maximum ${poll.maxChoices} choices allowed`);
    }

    // Check multiple choice
    if (!poll.allowMultiple && optionIds.length > 1) {
      throw new BadRequestException('Multiple choices not allowed');
    }

    // Record votes
    await this.prisma.pollVote.createMany({
      data: optionIds.map(optionId => ({
        pollId,
        optionId,
        userId,
      })),
    });

    // Update vote counts
    await this.prisma.pollOption.updateMany({
      where: { id: { in: optionIds } },
      data: { voteCount: { increment: 1 } },
    });

    // Update total votes
    await this.prisma.poll.update({
      where: { id: pollId },
      data: { totalVotes: { increment: optionIds.length } },
    });

    return { success: true };
  }

  async changeVote(pollId: string, newOptionIds: string[], userId: string) {
    // Get existing votes
    const existingVotes = await this.prisma.pollVote.findMany({
      where: { pollId, userId },
    });

    if (existingVotes.length === 0) {
      throw new BadRequestException('You have not voted yet');
    }

    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    // Remove old votes
    await this.prisma.pollVote.deleteMany({
      where: { pollId, userId },
    });

    // Decrease old vote counts
    await this.prisma.pollOption.updateMany({
      where: { id: { in: existingVotes.map(v => v.optionId) } },
      data: { voteCount: { decrement: 1 } },
    });

    // Vote with new options
    return this.vote(pollId, newOptionIds, userId);
  }

  async closePoll(pollId: string, userId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: { topic: true },
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    if (poll.topic.authorId !== userId) {
      throw new ForbiddenException('Only the poll author can close the poll');
    }

    return this.prisma.poll.update({
      where: { id: pollId },
      data: { isActive: false },
    });
  }

  async getPollStats(pollId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          orderBy: { voteCount: 'desc' },
        },
      },
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    return {
      totalVotes: poll.totalVotes,
      isActive: poll.isActive,
      hasEnded: poll.endsAt ? new Date() > poll.endsAt : false,
      options: poll.options.map(opt => ({
        text: opt.text,
        voteCount: opt.voteCount,
        percentage: poll.totalVotes > 0 ? (opt.voteCount / poll.totalVotes) * 100 : 0,
      })),
      winningOption: poll.options[0]?.text || null,
    };
  }
}
