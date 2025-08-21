// import { Account } from "@/domains/account/account.type";
// import { Workspace } from "@prisma/client";

export {};

declare global {
  namespace Express {
    interface Request {
      accountUid: string;
      workspaceUid: string;
      // account?: Account;
      // workspace?: Workspace;
    }
  }
}
