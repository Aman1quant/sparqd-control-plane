import { onboardNewUser } from './onboarding.service';
import * as UserService from '@domains/user/user.service';
import * as AccountService from '@domains/account/account.service';
import * as AccountMemberService from '@domains/account/accountMember.service';
import * as KeycloakService from '@domains/authentication/keycloakAdmin.service';

jest.mock('@domains/user/user.service');
jest.mock('@domains/account/account.service');
jest.mock('@domains/account/accountMember.service');
jest.mock('@domains/authentication/keycloakAdmin.service');

const mockInput = {
  email: 'test@example.com',
  kcSub: 'kc-sub-id',
  fullName: 'Test User',
  avatarUrl: 'http://avatar.png',
  accountName: 'TestCorp',
  roleId: 1,
};

const mockUser = {
  id: 1,
  email: mockInput.email,
  kcSub: mockInput.kcSub,
};

const mockAccount = {
  id: 100,
  uid: 'acc-uid-123',
  name: mockInput.accountName,
};

const mockAccountMember = {
  id: 200,
  userId: mockUser.id,
  accountId: mockAccount.id,
  roleId: mockInput.roleId,
};

const mockFinalUser = {
  ...mockUser,
  accounts: [mockAccountMember],
};

describe('onboardNewUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should onboard a new user and provision Keycloak realm', async () => {
    // Mock TX methods
    (UserService.createUserTx as jest.Mock).mockResolvedValue(mockUser);
    (AccountService.createAccountTx as jest.Mock).mockResolvedValue(mockAccount);
    (AccountMemberService.createAccountMemberTx as jest.Mock).mockResolvedValue(mockAccountMember);
    (KeycloakService.provisionNewRealm as jest.Mock).mockResolvedValue(undefined);
    (AccountService.editAccount as jest.Mock).mockResolvedValue(undefined);
    (UserService.getUserByKcSub as jest.Mock).mockResolvedValue(mockFinalUser);

    const result = await onboardNewUser(mockInput);

    expect(UserService.createUserTx).toHaveBeenCalled();
    expect(AccountService.createAccountTx).toHaveBeenCalled();
    expect(AccountMemberService.createAccountMemberTx).toHaveBeenCalled();
    expect(KeycloakService.provisionNewRealm).toHaveBeenCalledWith(mockAccount.uid, mockUser.email);
    expect(AccountService.editAccount).toHaveBeenCalledWith(mockAccount.uid, { kcRealmStatus: 'FINALIZED' });
    expect(UserService.getUserByKcSub).toHaveBeenCalledWith(mockUser.kcSub);

    expect(result).toEqual(mockFinalUser);
  });

  it('should throw if user creation fails', async () => {
    (UserService.createUserTx as jest.Mock).mockRejectedValue(new Error('DB error'));

    await expect(onboardNewUser(mockInput)).rejects.toThrow('DB error');
  });
});
