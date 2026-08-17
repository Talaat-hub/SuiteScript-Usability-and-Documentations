let configState = {
  [ 'companyinformation' ]: {},
  [ 'accountingpreferences' ]: {},
  [ 'generalpreferences' ]: {},
  [ 'userpreferences' ]: {},
};

const buildConfigRecord = (type) => ({
  type,

  getValue: jest.fn(({ fieldId }) => {
    return configState[type]?.[fieldId];
  }),

  setValue: jest.fn(({ fieldId, value }) => {
    if (!configState[type]) {
      configState[type] = {};
    }
    configState[type][fieldId] = value;
  }),

  getText: jest.fn(({ fieldId }) => {
    return configState[type]?.[fieldId];
  }),

  save: jest.fn(() => true),
});

module.exports = {
  load: jest.fn(({ type }) => {
    return buildConfigRecord(type);
  }),

  Type: {
    COMPANY_INFORMATION: 'companyinformation',
    ACCOUNTING_PREFERENCES: 'accountingpreferences',
    GENERAL_PREFERENCES: 'generalpreferences',
    USER_PREFERENCES: 'userpreferences',
  },

  __setValue: (type, fieldId, value) => {
    if (!configState[type]) {
      configState[type] = {};
    }
    configState[type][fieldId] = value;
  },

  __getState: () => JSON.parse(JSON.stringify(configState)),

  __reset: () => {
    configState = {
      companyinformation: {},
      accountingpreferences: {},
      generalpreferences: {},
      userpreferences: {},
    };
    jest.clearAllMocks();
  },
};
