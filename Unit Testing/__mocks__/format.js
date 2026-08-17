module.exports = {
    Type: {
      DATE: 'date',
      DATETIME: 'datetime',
    },
    parse: jest.fn(({ value }) => value),
    format: jest.fn(({ value }) => value),
  };
  