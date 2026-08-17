let recordState = {};

const currentRecord = {
  get: jest.fn(() => ({
    getValue: jest.fn((fieldId) => recordState[fieldId]),
    setValue: jest.fn(({ fieldId, value }) => {
      recordState[fieldId] = value;
    }),
    getText: jest.fn((fieldId) => recordState[fieldId]),
    setText: jest.fn(({ fieldId, text }) => {
      recordState[fieldId] = text;
    }),
    getField: jest.fn((fieldId) => ({
      id: fieldId,
      isDisabled: false,
      isDisplay: true,
    })),
  })),

  __setValue: (fieldId, value) => {
    recordState[fieldId] = value;
  },

  __getState: () => ({ ...recordState }),

  __reset: () => {
    recordState = {};
    jest.clearAllMocks();
  },
};

module.exports = currentRecord;
