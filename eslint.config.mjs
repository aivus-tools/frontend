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
    'prettier/prettier': 'off', // Disable Prettier in ESLint (runs as standalone formatter only)
    '@typescript-eslint/no-unused-vars': ['warn'], // Warnings only, not errors
    'import/no-unused-modules': 'off', // Disable unused modules check
    '@typescript-eslint/no-explicit-any': 'warn', // Warnings only for any
  },
});

export default eslintConfig;
