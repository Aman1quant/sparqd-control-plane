export {};

declare global {
  namespace Express {
    interface Request {
      accountUid: string;
      workspaceUid: string;
      account: DescribeAccount;
      workspace: Workspace;
    }
  }
}
