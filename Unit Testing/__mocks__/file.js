module.exports = {
  Type: {
    PDF: 'pdf',
    CSV: 'csv',
  },
  create: jest.fn(() => ({
    save: jest.fn(() => 111),
  })),
  load: jest.fn(() => ({
    getContents: jest.fn(() => ''),
  })),
  create: jest.fn(),
};
