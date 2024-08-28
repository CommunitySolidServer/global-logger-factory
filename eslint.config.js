const opinionated = require('opinionated-eslint-config');

module.exports = opinionated({
  typescript: {
    tsconfigPath: [ './tsconfig.json', './scripts/tsconfig.json', './test/tsconfig.json' ],
  },
  ignores: [
    // Can't figure out why linter is complaining about the TS in the README
    '*.md',
  ],
});
