module.exports = {
    FieldType: {
      TEXT: 'text',
      SELECT: 'select',
      CHECKBOX: 'checkbox',
      DATE: 'date',
      FLOAT: 'float',
      INLINEHTML: 'inlinehtml',
    },
  
    FieldDisplayType: {
      NORMAL: 'normal',
      DISABLED: 'disabled',
      HIDDEN: 'hidden',
      READONLY: 'readonly',
    },
  
    SublistType: {
      LIST: 'list',
      INLINEEDITOR: 'inlineeditor',
    },
  
    createForm: jest.fn(() => ({
      addField: jest.fn(() => ({
        updateDisplayType: jest.fn(),
        isMandatory: false,
        defaultValue: null,
        helpText: '',
      })),
  
      addSublist: jest.fn(() => ({
        addField: jest.fn(() => ({
          updateDisplayType: jest.fn(),
        })),
        addButton: jest.fn(),
        setSublistValue: jest.fn(),
        getField: jest.fn(() => ({
          updateDisplayType: jest.fn(),
        })),
        addMarkAllButtons: jest.fn(),
      })),
  
      addSubmitButton: jest.fn(),
      addButton: jest.fn(),
      addResetButton: jest.fn(),
      removeButton: jest.fn(),
      updatePageTitle: jest.fn(),
      getField: jest.fn(),
      clientScriptModulePath: null,
    })),
  };
  