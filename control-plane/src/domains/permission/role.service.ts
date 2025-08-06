import { PrismaClient, Role } from '@prisma/client';

import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';

const prisma = new PrismaClient();

interface CreateRoleData {
  name: string;
  description?: string;
}

interface UpdateRoleData {
  name?: string;
  description?: string;
}

interface RoleListFilters {
  name?: string;
  description?: string;
  page?: number;
  limit?: number;
}

export async function listRole({ name, description, page = 1, limit = 10 }: RoleListFilters): Promise<PaginatedResponse<Role>> {
  const whereClause: Record<string, unknown> = {};

  if (name) {
    whereClause.name = {
      contains: name,
      mode: 'insensitive' as const,
    };
  }

  if (description) {
    whereClause.description = {
      contains: description,
      mode: 'insensitive' as const,
    };
  }

  const [totalData, roles] = await Promise.all([
    prisma.role.count({ where: whereClause }),
    prisma.role.findMany({
      where: whereClause,
      orderBy: { id: 'desc' },
      skip: offsetPagination(page, limit),
      take: limit,
      include: {
        permissions: {
          include: {
            permission: {
              select: {
                uid: true,
                action: true,
                description: true,
              },
            },
          },
        },
        accountMembers: {
          include: {
            user: {
              select: {
                uid: true,
                email: true,
                fullName: true,
              },
            },
            account: {
              select: {
                uid: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            permissions: true,
            accountMembers: true,
            resourcePermissions: true,
          },
        },
      },
    }),
  ]);

  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(totalData / limit),
    totalData,
    limit,
    hasNextPage: page < Math.ceil(totalData / limit),
    hasPreviousPage: page > 1,
  };

  return {
    data: roles,
    pagination,
  };
}

export async function detailRole(uid: string): Promise<Role | null> {
  const role = await prisma.role.findUnique({
    where: { uid },
    include: {
      permissions: {
        include: {
          permission: {
            select: {
              uid: true,
              action: true,
              description: true,
            },
          },
        },
      },
      accountMembers: {
        include: {
          user: {
            select: {
              uid: true,
              email: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          account: {
            select: {
              uid: true,
              name: true,
            },
          },
        },
      },
      resourcePermissions: {
        include: {
          user: {
            select: {
              uid: true,
              email: true,
              fullName: true,
            },
          },
          account: {
            select: {
              uid: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          permissions: true,
          accountMembers: true,
          resourcePermissions: true,
        },
      },
    },
  });

  return role;
}

export async function createRole(data: CreateRoleData): Promise<Role> {
  const existingRole = await prisma.role.findUnique({
    where: { name: data.name },
  });

  if (existingRole) {
    throw {
      status: 409,
      message: 'Role with this name already exists',
    };
  }

  const role = await prisma.role.create({
    data: {
      name: data.name,
      description: data.description,
    },
    include: {
      permissions: {
        include: {
          permission: {
            select: {
              uid: true,
              action: true,
              description: true,
            },
          },
        },
      },
      accountMembers: {
        include: {
          user: {
            select: {
              uid: true,
              email: true,
              fullName: true,
            },
          },
          account: {
            select: {
              uid: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          permissions: true,
          accountMembers: true,
          resourcePermissions: true,
        },
      },
    },
  });

  return role;
}

export async function editRole(uid: string, data: UpdateRoleData): Promise<Role> {
  const existingRole = await prisma.role.findUnique({
    where: { uid },
  });

  if (!existingRole) {
    throw {
      status: 404,
      message: 'Role not found',
    };
  }

  if (data.name && data.name !== existingRole.name) {
    const nameConflict = await prisma.role.findUnique({
      where: { name: data.name },
    });

    if (nameConflict) {
      throw {
        status: 409,
        message: 'Role with this name already exists',
      };
    }
  }

  const role = await prisma.role.update({
    where: { uid },
    data,
    include: {
      permissions: {
        include: {
          permission: {
            select: {
              uid: true,
              action: true,
              description: true,
            },
          },
        },
      },
      accountMembers: {
        include: {
          user: {
            select: {
              uid: true,
              email: true,
              fullName: true,
            },
          },
          account: {
            select: {
              uid: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          permissions: true,
          accountMembers: true,
          resourcePermissions: true,
        },
      },
    },
  });

  return role;
}

export async function deleteRole(uid: string): Promise<Role> {
  const existingRole = await prisma.role.findUnique({
    where: { uid },
  });

  if (!existingRole) {
    throw {
      status: 404,
      message: 'Role not found',
    };
  }

  const accountMembers = await prisma.accountMember.findMany({
    where: { roleId: existingRole.id },
  });

  if (accountMembers.length > 0) {
    throw {
      status: 409,
      message: 'Cannot delete role that is assigned to account members',
    };
  }

  const resourcePermissions = await prisma.resourcePermission.findMany({
    where: { roleId: existingRole.id },
  });

  if (resourcePermissions.length > 0) {
    throw {
      status: 409,
      message: 'Cannot delete role that has resource permissions',
    };
  }

  const role = await prisma.role.delete({
    where: { uid },
  });

  return role;
}

export async function getRoleByName(name: string): Promise<Role | null> {
  const role = await prisma.role.findUnique({
    where: { name },
    include: {
      permissions: {
        include: {
          permission: {
            select: {
              uid: true,
              action: true,
              description: true,
            },
          },
        },
      },
      accountMembers: {
        include: {
          user: {
            select: {
              uid: true,
              email: true,
              fullName: true,
            },
          },
          account: {
            select: {
              uid: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          permissions: true,
          accountMembers: true,
          resourcePermissions: true,
        },
      },
    },
  });

  return role;
}

export async function assignPermissionsToRole(roleUid: string, permissionUids: string[]): Promise<Role> {
  const role = await prisma.role.findUnique({
    where: { uid: roleUid },
  });

  if (!role) {
    throw {
      status: 404,
      message: 'Role not found',
    };
  }

  // Get permission IDs from UIDs
  const permissions = await prisma.permission.findMany({
    where: {
      uid: {
        in: permissionUids,
      },
    },
  });

  if (permissions.length !== permissionUids.length) {
    throw {
      status: 404,
      message: 'One or more permissions not found',
    };
  }

  // Create role-permission relationships
  const rolePermissionData = permissions.map((permission) => ({
    roleId: role.id,
    permissionId: permission.id,
  }));

  await prisma.rolePermission.createMany({
    data: rolePermissionData,
    skipDuplicates: true,
  });

  return detailRole(roleUid) as Promise<Role>;
}

export async function removePermissionsFromRole(roleUid: string, permissionUids: string[]): Promise<Role> {
  const role = await prisma.role.findUnique({
    where: { uid: roleUid },
  });

  if (!role) {
    throw {
      status: 404,
      message: 'Role not found',
    };
  }

  // Get permission IDs from UIDs
  const permissions = await prisma.permission.findMany({
    where: {
      uid: {
        in: permissionUids,
      },
    },
  });

  if (permissions.length !== permissionUids.length) {
    throw {
      status: 404,
      message: 'One or more permissions not found',
    };
  }

  // Remove role-permission relationships
  await prisma.rolePermission.deleteMany({
    where: {
      roleId: role.id,
      permissionId: {
        in: permissions.map((p) => p.id),
      },
    },
  });

  return detailRole(roleUid) as Promise<Role>;
}
