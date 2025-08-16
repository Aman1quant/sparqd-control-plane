import { AccountPlanEnum } from "../_shared/shared.dto";

export interface OnboardedUser {
  email: string;
  uid: string;
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

export type OnboardNewUserInput = {
  email: string;
  kcSub: string;
  fullName?: string;
  avatarUrl?: string;
  accountName: string;
};
