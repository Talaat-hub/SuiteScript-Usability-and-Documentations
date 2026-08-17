module.exports = {
    TaskType: {
      MAP_REDUCE: 'mapreduce',
      SCHEDULED_SCRIPT: 'scheduledscript',
    },
    create: jest.fn(() => ({
      submit: jest.fn(() => 'task_123'),
    })),
  };
  