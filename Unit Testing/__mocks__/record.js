const baseRecord = () => ({
  id: '123',
  type: 'customrecord_test',
  isDynamic: true,

  getValue: jest.fn(),
  setValue: jest.fn(),

  getText: jest.fn(),
  setText: jest.fn(),

  getLineCount: jest.fn(() => 0),

  selectNewLine: jest.fn(),
  commitLine: jest.fn(),
  removeLine: jest.fn(),
  insertLine: jest.fn(),

  getSublistValue: jest.fn(),
  setSublistValue: jest.fn(),
  setCurrentSublistValue: jest.fn(),
  getSublistText: jest.fn(),

  findSublistLineWithValue: jest.fn(() => -1),

  hasSublistSubrecord: jest.fn(() => false),
  getSublistSubrecord: jest.fn(),
  getCurrentSublistSubrecord: jest.fn(() => baseRecord()),

  save: jest.fn(() => 5555),
});

module.exports = {
  Type: {
    SALES_ORDER: 'salesorder',
    PURCHASE_REQUISITION: 'purchaserequisition'
  },
  create: jest.fn(() => baseRecord()),
  load: jest.fn(() => baseRecord()),
  submitFields: jest.fn(() => 5555),
  delete: jest.fn(),
};
