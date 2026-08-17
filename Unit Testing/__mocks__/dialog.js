let dialogResponse = {
  confirm: true,
  prompt: 'ok',
};

module.exports = {
  alert: jest.fn(() => Promise.resolve()),

  confirm: jest.fn(() => Promise.resolve(dialogResponse.confirm)),

  prompt: jest.fn(() =>
    Promise.resolve({
      value: dialogResponse.prompt,
    })
  ),

  // 🔥 test helpers
  __setConfirm: (val) => {
    dialogResponse.confirm = val;
  },

  __setPrompt: (val) => {
    dialogResponse.prompt = val;
  },

  __reject: (err) => {
    module.exports.alert.mockImplementation(() => Promise.reject(err));
    module.exports.confirm.mockImplementation(() => Promise.reject(err));
    module.exports.prompt.mockImplementation(() => Promise.reject(err));
  },

  __reset: () => {
    dialogResponse = { confirm: true, prompt: 'ok' };
    jest.clearAllMocks();
  },
};