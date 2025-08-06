/**
 * Internal representation: used within backend services, includes DB ID.
 */
export interface InternalUser {
  id: bigint;
  uid: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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
