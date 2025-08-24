import { AccountPlanEnum } from '../_shared/shared.dto';

export interface OnboardedUser {
  /**
   * User unique ID
   * @example "83ef9fc3-159c-43fc-a31f-0d4575dc373c"
   */
  uid: string;
  /**
   * Email
   * @example "john.doe@example.com"
   */
  email: string;
  /**
   * User full name
   * @example "John Doe"
   */
  fullName: string | null;
  /**
   * User avatar URL
   * @example "https://example.com/avatars/6hy2w27h.png"
   */
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
