const MessageType = {
  CONFIRMATION: 'confirmation',
  INFORMATION: 'information',
  WARNING: 'warning',
  ERROR: 'error',
};

const create = jest.fn((options) => ({
  ...options,
  show: jest.fn(),
}));

module.exports = {
  create,
  Type: MessageType,
};