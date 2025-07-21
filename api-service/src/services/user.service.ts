import { Prisma, PrismaClient } from '@prisma/client';
// import { userSelect } from '@/constants/user.select';


const prisma = new PrismaClient();

// Types
type CreateUserInput = Prisma.UserCreateInput;
type UpdateUserInput = Prisma.UserUpdateInput;
type UserWhereUniqueInput = Prisma.UserWhereUniqueInput;
type UserWhereInput = Prisma.UserWhereInput;

// CREATE
export async function createUser(data: CreateUserInput) {
  return await prisma.user.create({
    data,
    // select: userSelect,
  });
}

// READ - by ID
export async function getUserById(id: number) {
  return await prisma.user.findUnique({
    where: { id },
    // select: userSelect,
  });
}

// READ - by UID
export async function getUserByUid(uid: string) {
  return await prisma.user.findUnique({
    where: { uid },
    // select: userSelect,
  });
}

// READ - by sub
export async function getUserByKcSub(kcSub: string) {
  return await prisma.user.findUnique({
    where: { kcSub },
    // select: userSelect,
  });
}

// READ - get many users (with optional filter/pagination)
export async function getAllUsers(where: UserWhereInput = {}, skip = 0, take = 100) {
  return await prisma.user.findMany({
    where,
    skip,
    take,
    // select: userSelect,
    orderBy: { createdAt: 'desc' },
  });
}

// UPDATE
export async function updateUser(where: UserWhereUniqueInput, data: UpdateUserInput) {
  return await prisma.user.update({
    where,
    data,
    // select: userSelect,
  });
}

// DELETE
export async function deleteUser(where: UserWhereUniqueInput) {
  return await prisma.user.delete({
    where,
    // select: userSelect,
  });
}
