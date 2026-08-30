import eslintPluginAstro from 'eslint-plugin-astro';
import eslintPluginReactGoogleTranslate from 'eslint-plugin-react-google-translate';
import typescriptParser from '@typescript-eslint/parser';

export default [
  // add more generic rule sets here, such as:
  // js.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginAstro.configs['jsx-a11y-recommended'],
  {
    plugins: {
      'react-google-translate': eslintPluginReactGoogleTranslate,
    },
    rules: {},
  },
  {
    // 添加对 TypeScript 文件的支持
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {},
  },
  {
    // 忽略 Markdown、JSON 和其他非代码文件
    ignores: ['**/*.md', '**/*.mdx', '**/*.json', '**/*.txt', '**/*.yml', '**/*.yaml']
  }
];
