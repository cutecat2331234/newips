import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

// Permission definitions
export const PERMISSIONS = {
  // Forum permissions
  'forum.view': 'View forum',
  'forum.createTopic': 'Create topics',
  'forum.reply': 'Reply to topics',
  'forum.editOwn': 'Edit own content',
  'forum.deleteOwn': 'Delete own content',
  'forum.editAny': 'Edit any content',
  'forum.deleteAny': 'Delete any content',
  'forum.pinTopic': 'Pin topics',
  'forum.lockTopic': 'Lock topics',
  'forum.moveTopic': 'Move topics',
  'forum.featureTopic': 'Feature topics',
  
  // Moderation permissions
  'mod.viewReports': 'View reports',
  'mod.handleReports': 'Handle reports',
  'mod.warnUsers': 'Warn users',
  'mod.banUsers': 'Ban users',
  'mod.editProfiles': 'Edit user profiles',
  
  // Admin permissions
  'admin.settings': 'Manage settings',
  'admin.users': 'Manage users',
  'admin.categories': 'Manage categories',
  'admin.groups': 'Manage groups',
  'admin.badges': 'Manage badges',
  'admin.ads': 'Manage ads',
  'admin.themes': 'Manage themes',
  
  // Group permissions
  'group.create': 'Create groups',
  'group.join': 'Join groups',
  'group.manage': 'Manage groups',
  
  // Media permissions
  'media.upload': 'Upload media',
  'media.deleteOwn': 'Delete own media',
  'media.deleteAny': 'Delete any media',
};

// Default role-permission mappings
const ROLE_PERMISSIONS: Record<string, string[]> = {
  guest: [
    'forum.view',
    'group.join',
  ],
  member: [
    'forum.view',
    'forum.createTopic',
    'forum.reply',
    'forum.editOwn',
    'forum.deleteOwn',
    'group.create',
    'group.join',
    'media.upload',
    'media.deleteOwn',
  ],
  moderator: [
    'forum.view',
    'forum.createTopic',
    'forum.reply',
    'forum.editOwn',
    'forum.deleteOwn',
    'forum.editAny',
    'forum.deleteAny',
    'forum.pinTopic',
    'forum.lockTopic',
    'forum.moveTopic',
    'mod.viewReports',
    'mod.handleReports',
    'mod.warnUsers',
    'group.create',
    'group.join',
    'group.manage',
    'media.upload',
    'media.deleteOwn',
    'media.deleteAny',
  ],
  admin: Object.keys(PERMISSIONS),
};

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async initializeRoles() {
    for (const [name, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      const role = await this.prisma.role.upsert({
        where: { name },
        update: {},
        create: {
          name,
          permissions,
        },
      });

      // Create role-permission records
      await this.prisma.rolePermission.deleteMany({
        where: { roleId: role.id },
      });

      for (const permission of permissions) {
        await this.prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permission,
          },
        });
      }
    }
  }

  async getRoles() {
    const roles = await this.prisma.role.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return roles;
  }

  async getRoleByName(name: string) {
    return this.prisma.role.findUnique({
      where: { name },
      include: { permissions: true },
    });
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      return [];
    }

    // Get permissions from roles
    const rolePermissions = user.roles.flatMap(
      ur => ur.role.permissions.map(p => p.permission)
    );

    // Add individual permissions if any
    const individualPermissions = user.customPermissions || [];

    return [...new Set([...rolePermissions, ...individualPermissions])];
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }

  async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.some(p => userPermissions.includes(p));
  }

  async hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.every(p => userPermissions.includes(p));
  }

  async assignRole(userId: string, roleName: string) {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const existing = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.userRole.create({
      data: {
        userId,
        roleId: role.id,
      },
    });
  }

  async removeRole(userId: string, roleName: string) {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
    });
  }

  async getUserRoles(userId: string) {
    const roles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });

    return roles.map(ur => ur.role);
  }

  async updateRolePermissions(roleName: string, permissions: string[]) {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Cannot modify admin role permissions
    if (roleName === 'admin') {
      throw new ForbiddenException('Cannot modify admin role permissions');
    }

    // Update role
    await this.prisma.role.update({
      where: { id: role.id },
      data: { permissions },
    });

    // Replace permissions
    await this.prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    for (const permission of permissions) {
      await this.prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permission,
        },
      });
    }

    return this.getRoleByName(roleName);
  }

  async createCustomRole(name: string, permissions: string[], description?: string) {
    // Check if role exists
    const existing = await this.prisma.role.findUnique({
      where: { name },
    });

    if (existing) {
      throw new Error('Role already exists');
    }

    return this.prisma.role.create({
      data: {
        name,
        permissions,
        description,
        isCustom: true,
      },
    });
  }

  async deleteCustomRole(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (!role.isCustom) {
      throw new ForbiddenException('Cannot delete built-in roles');
    }

    // Remove role from all users
    await this.prisma.userRole.deleteMany({
      where: { roleId },
    });

    return this.prisma.role.delete({
      where: { id: roleId },
    });
  }

  async checkPermissionGuard(userId: string, requiredPermission: string) {
    const hasPermission = await this.hasPermission(userId, requiredPermission);
    if (!hasPermission) {
      throw new ForbiddenException(`Missing permission: ${requiredPermission}`);
    }
  }
}
