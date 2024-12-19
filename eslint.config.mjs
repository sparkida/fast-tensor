import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config([
  {
    files: ['src/ts/**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'no-console': 'warn',
      'no-prototype-builtins': 'off',
    },
  }, {
    files: ['test/**/*.ts'],
    env: {
      mocha: true,
    },
    languageOptions: {
      parserOptions: {
        project: './test/tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    globals: {
      expect: false,
      Matrix: false,
    },
  }
]);
