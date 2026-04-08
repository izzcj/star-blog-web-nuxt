import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  {
    rules: {
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/brace-style': 'off',
      '@typescript-eslint/prefer-literal-enum-member': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@stylistic/arrow-parens': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
    },
  },
);
