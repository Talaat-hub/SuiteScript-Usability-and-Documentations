const mockQueryResult = {
    asMappedResults: jest.fn(() => []),
    iterator: jest.fn(() => ({
      each: jest.fn(),
    })),
  };
  
  module.exports = {
    runSuiteQL: jest.fn(() => mockQueryResult),
    runSuiteQLPaged: jest.fn(() => ({
      count: 0,
      iterator: jest.fn(),
    })),
    create: jest.fn(() => ({
      run: jest.fn(() => mockQueryResult),
    })),
  };