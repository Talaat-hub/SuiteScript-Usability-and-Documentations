module.exports = {
  Encoding: {
    UTF_8: 'UTF_8',
    BASE_64: 'BASE_64',
    BASE_64_URL_SAFE: 'BASE_64_URL_SAFE',
    HEX: 'HEX',
  },
  encode: jest.fn((options) => {
    if (options.toEncoding === 'BASE_64') {
      return Buffer.from(options.input).toString('base64');
    }
    return options.input;
  }),
  decode: jest.fn((options) => {
    if (options.fromEncoding === 'BASE_64') {
      return Buffer.from(options.input, 'base64').toString('utf8');
    }
    return options.input;
  }),
  convert: jest.fn((options) => {
    return options.input;
  }),
};