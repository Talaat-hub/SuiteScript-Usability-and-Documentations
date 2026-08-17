const mockCache = {
    get: jest.fn((options) => {
      if (options.loader) {
        return options.loader();
      }
      return null;
    }),
    put: jest.fn(),
    remove: jest.fn(),
  };
  
  module.exports = {
    getCache: jest.fn(() => mockCache),
    Scope: {
      PRIVATE: 'PRIVATE',
      PUBLIC: 'PUBLIC',
    },
  };