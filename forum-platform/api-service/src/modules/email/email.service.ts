import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

@Injectable()
export class EmailService {
  constructor(private prisma: PrismaService) {}

  private readonly templates: Record<string, EmailTemplate> = {
    welcome: {
      subject: 'Welcome to {{forumName}}!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to {{forumName}}!</h1>
          <p>Hi {{displayName}},</p>
          <p>Thank you for joining our community! We're excited to have you on board.</p>
          <p>Here are some things you can do to get started:</p>
          <ul>
            <li>Complete your profile</li>
            <li>Introduce yourself in the community</li>
            <li>Browse and join discussions</li>
            <li>Connect with like-minded members</li>
          </ul>
          <a href="{{forumUrl}}/welcome" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin-top: 16px;">Get Started</a>
          <p style="margin-top: 32px; color: #666; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
        </div>
      `,
      text: `Welcome to {{forumName}}! Hi {{displayName}}, Thank you for joining our community! Visit {{forumUrl}}/welcome to get started.`,
    },

    passwordReset: {
      subject: 'Reset Your Password - {{forumName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Password Reset Request</h1>
          <p>Hi {{displayName}},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="{{resetUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">Reset Password</a>
          <p>This link will expire in {{expiryHours}} hours.</p>
          <p>If you didn't request a password reset, please ignore this email. Your account is safe.</p>
          <p style="margin-top: 32px; color: #666; font-size: 12px;">
            If the button doesn't work, copy and paste this URL into your browser:<br>
            {{resetUrl}}
          </p>
        </div>
      `,
      text: `Password Reset Request - Hi {{displayName}}, We received a request to reset your password. Visit {{resetUrl}} to create a new password. This link will expire in {{expiryHours}} hours.`,
    },

    newReply: {
      subject: 'New reply to: "{{topicTitle}}"',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Reply Notification</h1>
          <p>Hi {{displayName}},</p>
          <p><strong>{{replierName}}</strong> replied to your topic "<strong>{{topicTitle}}</strong>":</p>
          <div style="background-color: #f8f9fa; padding: 16px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 0;">{{replyPreview}}...</p>
          </div>
          <a href="{{topicUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">View Reply</a>
          <p style="margin-top: 24px; color: #666; font-size: 14px;">
            You're receiving this because you follow this topic. <a href="{{unsubscribeUrl}}">Unsubscribe</a>
          </p>
        </div>
      `,
      text: `New Reply - {{replierName}} replied to your topic "{{topicTitle}}". View at: {{topicUrl}}`,
    },

    newTopic: {
      subject: 'New topic: "{{topicTitle}}"',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Topic in {{categoryName}}</h1>
          <p>Hi {{displayName}},</p>
          <p><strong>{{authorName}}</strong> started a new topic:</p>
          <h2 style="color: #007bff;">{{topicTitle}}</h2>
          <p>{{topicPreview}}...</p>
          <a href="{{topicUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px;">Read More</a>
          <p style="margin-top: 24px; color: #666; font-size: 14px;">
            You're receiving this because you follow {{categoryName}}. <a href="{{unsubscribeUrl}}">Unsubscribe</a>
          </p>
        </div>
      `,
      text: `New Topic: "{{topicTitle}}" by {{authorName}} in {{categoryName}}. Read at: {{topicUrl}}`,
    },

    mention: {
      subject: '{{mentionerName}} mentioned you',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">You were mentioned!</h1>
          <p>Hi {{displayName}},</p>
          <p><strong>{{mentionerName}}</strong> mentioned you in a {{contentType}}:</p>
          <div style="background-color: #fff3cd; padding: 16px; border-radius: 4px; margin: 16px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0;">{{mentionContent}}...</p>
          </div>
          <a href="{{contentUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">View {{contentType}}</a>
        </div>
      `,
      text: `{{mentionerName}} mentioned you in a {{contentType}}. View at: {{contentUrl}}`,
    },

    badgeEarned: {
      subject: 'Congratulations! You earned a new badge: {{badgeName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 32px 0;">
            <div style="font-size: 64px; margin-bottom: 16px;">{{badgeIcon}}</div>
            <h1 style="color: #333; margin-bottom: 8px;">Badge Earned!</h1>
            <p style="font-size: 18px; color: #666;">{{badgeDescription}}</p>
          </div>
          <p>Hi {{displayName}},</p>
          <p>Congratulations! You've earned the <strong>{{badgeName}}</strong> badge!</p>
          <p>This badge reflects your contribution and engagement in our community.</p>
          <a href="{{profileUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #ffc107; color: #333; text-decoration: none; border-radius: 4px;">View Your Profile</a>
        </div>
      `,
      text: `Congratulations! You earned the "{{badgeName}}" badge! View your profile at: {{profileUrl}}`,
    },

    digest: {
      subject: 'Your weekly digest from {{forumName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Your Weekly Digest</h1>
          <p>Hi {{displayName}}, here's what happened this week:</p>
          
          <h2 style="color: #007bff;">Popular Topics</h2>
          {{popularTopics}}
          
          <h2 style="color: #28a745;">Recent Activity</h2>
          {{recentActivity}}
          
          <h2 style="color: #ffc107;">Your Stats</h2>
          <ul>
            <li>Topics created: {{topicsCreated}}</li>
            <li>Replies posted: {{repliesPosted}}</li>
            <li>Likes received: {{likesReceived}}</li>
            <li>Reputation gained: +{{reputationGained}}</li>
          </ul>
          
          <a href="{{digestUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">View Full Digest</a>
        </div>
      `,
      text: `Your Weekly Digest - Popular: {{popularTopics}}. Your Stats: {{topicsCreated}} topics, {{repliesPosted}} replies.`,
    },

    newMessage: {
      subject: 'New message from {{senderName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Private Message</h1>
          <p>Hi {{displayName}},</p>
          <p><strong>{{senderName}}</strong> sent you a message:</p>
          <div style="background-color: #f8f9fa; padding: 16px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 0;">{{messagePreview}}...</p>
          </div>
          <a href="{{messageUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Read Message</a>
        </div>
      `,
      text: `{{senderName}} sent you a message: {{messagePreview}}. Read at: {{messageUrl}}`,
    },
  };

  async sendEmail(data: EmailData) {
    const template = this.templates[data.template];
    if (!template) {
      throw new Error(`Email template "${data.template}" not found`);
    }

    // Replace placeholders
    let subject = template.subject;
    let html = template.html;
    let text = template.text;

    Object.entries(data.data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      html = html.replace(new RegExp(placeholder, 'g'), String(value));
      text = text.replace(new RegExp(placeholder, 'g'), String(value));
    });

    // In production, this would use a real email service (SendGrid, SES, etc.)
    // For now, we'll log it
    console.log('📧 Email sent:', {
      to: data.to,
      subject,
    });

    // Store in database for audit
    await this.prisma.notification.create({
      data: {
        userId: data.data.userId || '',
        type: 'SYSTEM' as any,
        title: subject,
        message: text.slice(0, 255),
        metadata: { to: data.to, template: data.template },
      },
    });

    return { success: true, to: data.to, subject };
  }

  async sendWelcomeEmail(userId: string, email: string, displayName: string) {
    return this.sendEmail({
      to: email,
      subject: 'Welcome!',
      template: 'welcome',
      data: {
        userId,
        forumName: process.env.FORUM_NAME || 'ForumHub',
        forumUrl: process.env.FORUM_URL || 'http://localhost:3000',
        displayName,
        email,
      },
    });
  }

  async sendPasswordResetEmail(userId: string, email: string, displayName: string, resetToken: string) {
    const resetUrl = `${process.env.FORUM_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    return this.sendEmail({
      to: email,
      subject: 'Password Reset',
      template: 'passwordReset',
      data: {
        userId,
        displayName,
        resetUrl,
        expiryHours: 24,
      },
    });
  }

  async sendNewReplyNotification(
    userId: string,
    email: string,
    displayName: string,
    topicTitle: string,
    topicUrl: string,
    replierName: string,
    replyPreview: string
  ) {
    return this.sendEmail({
      to: email,
      subject: 'New reply',
      template: 'newReply',
      data: {
        userId,
        displayName,
        topicTitle,
        topicUrl,
        replierName,
        replyPreview,
        unsubscribeUrl: `${topicUrl}?unsubscribe=true`,
      },
    });
  }

  async sendMentionNotification(
    userId: string,
    email: string,
    displayName: string,
    mentionerName: string,
    contentType: string,
    contentUrl: string,
    mentionContent: string
  ) {
    return this.sendEmail({
      to: email,
      subject: 'You were mentioned',
      template: 'mention',
      data: {
        userId,
        displayName,
        mentionerName,
        contentType,
        contentUrl,
        mentionContent,
      },
    });
  }

  async sendBadgeNotification(
    userId: string,
    email: string,
    displayName: string,
    badgeName: string,
    badgeDescription: string,
    badgeIcon: string
  ) {
    return this.sendEmail({
      to: email,
      subject: 'Badge earned!',
      template: 'badgeEarned',
      data: {
        userId,
        displayName,
        badgeName,
        badgeDescription,
        badgeIcon,
        profileUrl: `${process.env.FORUM_URL || 'http://localhost:3000'}/users/${userId}`,
      },
    });
  }

  async sendDigest(
    userId: string,
    email: string,
    displayName: string,
    digestData: {
      popularTopics: string[];
      recentActivity: string[];
      topicsCreated: number;
      repliesPosted: number;
      likesReceived: number;
      reputationGained: number;
    }
  ) {
    return this.sendEmail({
      to: email,
      subject: 'Weekly Digest',
      template: 'digest',
      data: {
        userId,
        displayName,
        forumName: process.env.FORUM_NAME || 'ForumHub',
        ...digestData,
        digestUrl: `${process.env.FORUM_URL || 'http://localhost:3000'}/digest`,
        popularTopics: digestData.popularTopics.map(t => `<li>${t}</li>`).join(''),
        recentActivity: digestData.recentActivity.map(a => `<li>${a}</li>`).join(''),
      },
    });
  }

  async sendNewMessageNotification(
    userId: string,
    email: string,
    displayName: string,
    senderName: string,
    messagePreview: string
  ) {
    return this.sendEmail({
      to: email,
      subject: 'New message',
      template: 'newMessage',
      data: {
        userId,
        displayName,
        senderName,
        messagePreview,
        messageUrl: `${process.env.FORUM_URL || 'http://localhost:3000'}/messages`,
      },
    });
  }
}
