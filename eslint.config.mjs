import next from 'eslint-config-next';

const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'coverage/**'],
  },
  ...next,
  {
    rules: {
      '@next/next/no-img-element': 'off',
      'import/no-anonymous-default-export': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default config;
