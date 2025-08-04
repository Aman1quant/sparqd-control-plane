import { PrismaClient } from '@prisma/client';
import { UserSessionInfo } from '@domains/user/user.service';
import logger from '@/config/logger';

const prisma = new PrismaClient();

/******************************************************************************
 * Set current session context
 *****************************************************************************/

/******************************************************************************
 * Get current session context
 *****************************************************************************/
export interface GetCurrentSessionContextData {
  user: UserSessionInfo;
  activeAccountUid?: string;
  activeWorkspaceUid?: string;
}
export interface CurrentSessionContext {
  user: UserSessionInfo;
  activeAccount: any;
  activeWorkspace: any;
}
export async function getCurrentSessionContext(data: GetCurrentSessionContextData): Promise<CurrentSessionContext> {
  logger.debug(data);
  if (!data.activeAccountUid) {
    throw {
      status: 401,
      message: 'Unauthorized',
    };
  }
  const activeAccount = await prisma.account.findUnique({
    where: { uid: data.activeAccountUid },
    select: {
      uid: true,
      name: true,
    },
  });

  const activeWorkspace = await prisma.workspace.findUnique({
    where: { uid: data.activeWorkspaceUid },
    select: {
      uid: true,
      name: true,
    },
  });

  return {
    user: data.user,
    activeAccount,
    activeWorkspace,
    // roles: [],
    // permissions: [],
  };
}
