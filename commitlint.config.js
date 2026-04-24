module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat','fix','test','docs','refactor','perf','chore','ci','style','wip','backup','deploy'
    ]],
  },
};
