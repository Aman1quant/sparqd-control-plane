import { PrismaClient } from '@prisma/client';

import logger from '@/config/logger';

import { CurrentSessionContext, GetCurrentSessionContextData } from './session.types';

const prisma = new PrismaClient();

/******************************************************************************
 * Set current session context
 *****************************************************************************/

/******************************************************************************
 * Get current session context
 *****************************************************************************/
export async function getCurrentSessionContext(data: GetCurrentSessionContextData): Promise<CurrentSessionContext> {
  logger.debug({ data }, 'GetCurrentSessionContextData');
  if (!data.activeAccountUid) {
    logger.debug('activeAccountUid not available');
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
    // user: data.user,
    activeAccount,
    activeWorkspace,
    // roles: [],
    // permissions: [],
  };
}
