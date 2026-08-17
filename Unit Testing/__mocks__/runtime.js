module.exports = {
    executionContext: 'USERINTERFACE',
    ContextType: {
      USER_INTERFACE: 'USERINTERFACE',
      WEBSERVICES: 'WEBSERVICES',
      SCHEDULED: 'SCHEDULED',
    },
    getCurrentScript: jest.fn(() => ({
      getParameter: jest.fn(),
    })),
    getCurrentUser: jest.fn(() => ({
      id: '1',
      role: '3',
      name: 'Test User',
    })),
  };
  