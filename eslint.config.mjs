import tseslint from 'typescript-eslint';
export default tseslint.config(
  { ignores: ['**/dist/**', '**/.next/**', 'archive/**', 'node_modules/**', 'apps/studio/public/knowledge/**'] },
  ...tseslint.configs.recommended,
  { rules: { '@typescript-eslint/no-explicit-any': 'error', '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] } },
);
