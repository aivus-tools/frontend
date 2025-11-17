import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const eslintConfig = compat.config({
  extends: [
    'next/core-web-vitals',
    'next/typescript',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  rules: {
    'prettier/prettier': 'off', // Отключаем Prettier в ESLint (будет работать только как форматтер)
    '@typescript-eslint/no-unused-vars': ['warn'], // Только предупреждения, не ошибки
    'import/no-unused-modules': 'off', // Отключаем проверку неиспользуемых модулей
    '@typescript-eslint/no-explicit-any': 'warn', // Только предупреждения для any
  },
});

export default eslintConfig;
