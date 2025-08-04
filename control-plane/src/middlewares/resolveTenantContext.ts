import { Request, Response, NextFunction } from 'express';

export function resolveTenantContext(req: Request, res: Response, next: NextFunction) {
  const accountUid = req.headers['x-account-uid'] || req.cookies?.active_account_uid;
  const workspaceUid = req.headers['x-workspace-uid'] || req.cookies?.active_workspace_uid;
  console.log('accountUid', accountUid);

  // if (!accountId || typeof accountId !== 'string') {
  //   return res.status(400).json({ message: 'Missing account context' });
  // }

  // // Check if the user has access to the account (you must implement this based on your schema)
  // const userAccounts = req.user?.accounts.map(a => a.id) || [];
  // if (!userAccounts.includes(accountId)) {
  //   return res.status(403).json({ message: 'Access denied to this account' });
  // }

  // req.accountId = accountId;
  // req.workspaceId = typeof workspaceId === 'string' ? workspaceId : undefined;

  next();
}
