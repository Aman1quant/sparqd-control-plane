import { defineConfig, globalIgnores } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

export default defineConfig([
	globalIgnores([
		"node_modules/*",
    "dist",
    "tests",
	]),
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.ts', '**/*.cts', '**.*.mts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: process.cwd(),
      },
    },
    // plugins: {
    //   //   '@typescript-eslint': tseslint.plugin,
    //   //   // 'perfectionist': 'eslint-plugin-perfectionist',
    // },
    rules: {
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'never', prev: 'import', next: 'import' },
        { blankLine: 'always', prev: 'function', next: '*' },
        { blankLine: 'always', prev: 'class', next: '*' },
        { blankLine: 'always', prev: '*', next: ['function', 'class'] },
      ],
    },
  },
  tseslint.config(
    tseslint.configs.recommended
  ),
]);

// export default tseslint.config(
//   // eslint.configs.recommended,
//   tseslint.configs.recommended,
// );