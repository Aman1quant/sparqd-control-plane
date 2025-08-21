// import { UserSessionInfo } from "../user/user.type";

import { AccountPlanEnum } from "../_shared/shared.dto";

export interface SwitchSessionRequest {
  accountUid: string;
  workspaceUid: string;
}

export interface SessionContext {
  accountUid?: string;
  workspaceUid?: string;
}

export interface ActiveAccount {
  uid: string;
  name: string;
}

export interface ActiveWorkspace {
  uid: string;
  name: string;
}

export interface UserSessionInfo {
  uid: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  accountMembers: {
    account: {
      uid: string;
      createdAt: Date;
      name: string;
      plan: AccountPlanEnum;
      workspaces: {
        uid: string;
        createdAt: Date;
        name: string;
        members: {
          role: {
            uid: string;
            name: string;
            description: string | null;
          };
        }[];
      }[];
    };
    role: {
      uid: string;
      name: string;
      description: string | null;
    };
  }[];
}

export interface GetCurrentSessionContextData {
  user: UserSessionInfo;
  activeAccountUid?: string;
  activeWorkspaceUid?: string;
}
export interface CurrentSessionContext {
  // user: UserSessionInfo;
  activeAccount?: ActiveAccount | null;
  activeWorkspace?: ActiveWorkspace | null;
}