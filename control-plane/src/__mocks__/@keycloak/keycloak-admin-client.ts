const mockedClient = {
  realms: {
    find: jest.fn(),
    create: jest.fn(),
  },
  users: {
    find: jest.fn(),
    create: jest.fn(),
  },
  // add whatever you use
};

const KcAdminClient = jest.fn(() => mockedClient);

export default KcAdminClient;
