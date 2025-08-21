import { NextFunction, Request, Response } from 'express';

import logger from '@/config/logger';
// import { getAccount } from '../domains/account/account.service';
// import { getWorkspace } from '../domains/workspace/workspace.service';

// Common logic
function extractTenantContext(req: Request) {
  logger.debug({headers: req.headers}, "HAHAHA")
  // const accountUid = req.headers['x-account-uid'] || req.headers['X-Account-UID'] || req.cookies?.active_account;
  // const workspaceUid = req.headers['x-workspace-uid'] || req.headers['X-Workspace-UID'] || req.cookies?.active_workspace;

  const accountUid =
    (req.headers["x-account-uid"] as string | undefined) ||
    req.cookies?.active_account;

  const workspaceUid =
    (req.headers["x-workspace-uid"] as string | undefined) ||
    req.cookies?.active_workspace;

  return { accountUid, workspaceUid };
}

// Optional context (can be undefined)
export function resolveTenantContextOptional(req: Request, _res: Response, next: NextFunction) {
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

  if (!accountUid) {
    res.status(400).json({
      statusCode: 400,
      error: 'Missing active account context',
    });
    return;
  }

  req.accountUid = accountUid;
  req.workspaceUid = workspaceUid;
  // req.account = await getAccount(accountUid, req.user.id);
  // req.workspace = await getWorkspace(workspaceUid, req.user.id);
  next();
  return;
}
