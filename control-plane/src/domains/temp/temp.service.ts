import { PrismaClient } from "@prisma/client";
import { TempLoginRequest } from "./temp.type";
import { HttpError } from "@/types/errors";

const prisma = new PrismaClient();

export async function login(input: TempLoginRequest): Promise<any> {
  const tempUser = await prisma.tempUser.findUnique({ where: { username: input.username } })
  if (!tempUser) {
    throw new HttpError(401, 'Unauthorized');
  }

  // check password
  if (!(input.password === tempUser.password)) {
    throw new HttpError(401, 'Unauthorized');
  }
  return tempUser;
}
