let mockConfig = {
  response: {
    code: 200,
    body: '{}',
    headers: {},
  },
  throwError: null,
};

const buildResponse = () => ({
  code: mockConfig.response.code,
  body: mockConfig.response.body,
  headers: mockConfig.response.headers,
  getHeaders: jest.fn(() => mockConfig.response.headers),
});

const httpMethod = jest.fn((options = {}) => {
  // simulate timeout / exception
  if (mockConfig.throwError) {
    throw mockConfig.throwError;
  }

  return buildResponse();
});

module.exports = {
  // HTTP methods
  get: httpMethod,
  post: httpMethod,
  put: httpMethod,
  delete: httpMethod,
  request: httpMethod,

  // secure string (kept for parity)
  createSecureString: jest.fn((options) => ({
    append: jest.fn(),
    toString: jest.fn(() => options?.input || ''),
  })),

  // 🔥 test controls
  __setMockResponse: (response) => {
    mockConfig.response = {
      ...mockConfig.response,
      ...response,
    };
  },

  __throwError: (error) => {
    mockConfig.throwError = error;
  },

  __reset: () => {
    mockConfig = {
      response: {
        code: 200,
        body: '{}',
        headers: {},
      },
      throwError: null,
    };
  },
};