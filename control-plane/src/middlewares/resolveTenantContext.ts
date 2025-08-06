import { NextFunction, Request, Response } from 'express';

import logger from '@/config/logger';
import { detailAccount } from '@/domains/account/account.service';
import { detailWorkspace } from '@/domains/workspace/workspace.service';

// Common logic
function extractTenantContext(req: Request) {
  const accountUid = req.headers['x-account-uid'] || req.cookies?.active_account;
  const workspaceUid = req.headers['x-workspace-uid'] || req.cookies?.active_workspace;
  return { accountUid, workspaceUid };
}

// Optional context (can be undefined)
export function resolveTenantContextOptional(req: Request, res: Response, next: NextFunction) {
  const { accountUid, workspaceUid } = extractTenantContext(req);
  logger.debug({ originalUrl: req.originalUrl, accountUid, workspaceUid }, 'Optional context');
  req.accountUid = accountUid;
  req.workspaceUid = workspaceUid;
  next();
}

// Required context (throws if missing)
export async function resolveTenantContextRequired(req: Request, res: Response, next: NextFunction) {
  const { accountUid, workspaceUid } = extractTenantContext(req);
  logger.debug({ originalUrl: req.originalUrl, accountUid, workspaceUid }, 'Required context');

  if (!accountUid || !workspaceUid) {
    return res.status(400).json({
      statusCode: 400,
      error: 'Missing active account/workspace context',
    });
  }

  req.accountUid = accountUid;
  req.workspaceUid = workspaceUid;
  req.account = await detailAccount(accountUid);
  req.workspace = await detailWorkspace(workspaceUid);
  next();
}
