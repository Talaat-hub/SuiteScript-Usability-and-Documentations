module.exports = {
    create: jest.fn(({ name, message }) => {
      const err = new Error(message);
      err.name = name;
      return err;
    }),
  };
  