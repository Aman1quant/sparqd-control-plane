import { Prisma } from '@prisma/client';

import { baseUserSelect, internalUserSelect, userInternalSessionInfoSelect, userSessionInfoSelect } from './user.select';

// Interface for user creation
export interface CreateUserData {
  email: string;
  kcSub: string;
  fullName?: string;
  avatarUrl?: string;
}

// Interface for user update
export interface UpdateUserData {
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface UserListFilters {
  email?: string;
  fullName?: string;
  page?: number;
  limit?: number;
}

export interface CreatedByInfo {
  uid: string,
  email: string,
  fullName?: string,
}

/**
 * Public DTO: what you expose via API, removes internal `id`.
 */
export interface UserDTO {
  uid: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mapper function to convert Internal → DTO
 */
// export function toUserDTO(user: InternalUser): UserDTO {
//   const { id, ...dto } = user;
//   return dto;
// }

export type InternalUser = Prisma.UserGetPayload<{
  select: typeof internalUserSelect;
}>;

export type BaseUser = Prisma.UserGetPayload<{
  select: typeof baseUserSelect;
}>;

export type UserSessionInfo = Prisma.UserGetPayload<{
  select: typeof userSessionInfoSelect;
}>;

export type UserInternalSessionInfo = Prisma.UserGetPayload<{
  select: typeof userInternalSessionInfoSelect;
}>;
