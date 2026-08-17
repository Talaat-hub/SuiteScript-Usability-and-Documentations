const mockResult = (values = {}) => ({
  id: values.id || '1',
  getValue: jest.fn((f) => values[f]),
  getText: jest.fn((f) => values[`${f}_text`]),
  columns: [],
});

module.exports = {
  Type: {
    TRANSACTION: 'transaction',
    CUSTOMER: 'customer',
    VENDOR: 'vendor',
  },

  Operator: {
    IS: 'is',
    ANYOF: 'anyof',
    NONEOF: 'noneof',
    GREATERTHAN: 'greaterthan',
    ONORAFTER: 'onorafter',
    ONORBEFORE: 'onorbefore',
    WITHIN: 'within',
  },

  Sort: {
    ASC: 'ASC',
    DESC: 'DESC',
  },

  Summary: {
    SUM: 'SUM',
  },

  lookupFields: jest.fn(() => ({
    country: [{ value: '1', text: 'Egypt' }],
    currency: [{ value: '2', text: 'EGP' }]
  })),

  create: jest.fn(() => ({
    filters: [],
    columns: [],
    run: jest.fn(() => ({
      getRange: jest.fn(() => []),
      each: jest.fn((cb) => {
        cb(mockResult());
        return true;
      }),
    })),
    runPaged: jest.fn(() => ({
      count: 1,
      fetch: jest.fn(() => ({
        data: [mockResult()],
      })),
    })),
  })),

  load: jest.fn(() => ({
    filters: [],
    columns: [],
    run: jest.fn(() => ({
      getRange: jest.fn(() => []),
    })),
  })),

  createFilter: jest.fn((f) => f),
  createColumn: jest.fn((c) => c),
};