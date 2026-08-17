const mockResponse = {
  code: 200,
  body: '{}',
  headers: {},
  getHeaders: jest.fn(() => ({})),
};

module.exports = {
  get: jest.fn(() => mockResponse),
  post: jest.fn(() => mockResponse),
  put: jest.fn(() => mockResponse),
  delete: jest.fn(() => mockResponse),
  requestSuitelet: jest.fn(() => mockResponse),
  createSecureString: jest.fn((options) => ({
    append: jest.fn(),
    toString: jest.fn(() => options.input || ''),
  })),
};