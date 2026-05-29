const spfxProfile = require('@microsoft/eslint-config-spfx/lib/flat-profiles/react');

module.exports = [
  ...spfxProfile,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: './tsconfig.json'
      }
    },
    rules: {
      // Project customizations carried over from the previous .eslintrc.js.
      // These rules were intentionally disabled/relaxed by the project before
      // the SPFx 1.23 flat-config migration; the scaffolded flat config did not
      // preserve them, so they are restored here to keep the established policy.

      // SPFx scaffolds max-lines at 2000; this solution allows larger files.
      'max-lines': ['warn', { max: 3000 }],

      // Coding-style choices left to the developer.
      '@typescript-eslint/explicit-function-return-type': [
        0,
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: false
        }
      ],
      '@typescript-eslint/explicit-member-accessibility': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-floating-promises': 0,
      '@typescript-eslint/no-parameter-properties': 0,
      '@typescript-eslint/no-inferrable-types': 0,
      '@typescript-eslint/no-empty-interface': 0,
      '@typescript-eslint/no-empty-function': 0,
      '@typescript-eslint/ban-ts-comment': 0,
      // Dynamic require() calls are used intentionally for lazy-loading modules.
      '@typescript-eslint/no-require-imports': 0,
      'dot-notation': [0, { allowPattern: '^_' }],
      eqeqeq: 0,
      'no-empty': 0,
      'no-return-assign': 0,
      'prefer-const': 0,
      'no-useless-escape': 0,
      'no-case-declarations': 0,
      'no-extra-boolean-cast': 0,
      'react/self-closing-comp': 0,
      '@rushstack/security/no-unsafe-regexp': 0
    }
  }
];
