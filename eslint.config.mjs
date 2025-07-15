// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import mantine from 'eslint-config-mantine';
import tseslint from 'typescript-eslint';

export default tseslint.config(...mantine, { ignores: ['**/*.{mjs,cjs,js,d.ts,d.mts}'] }, {
  files: ['**/*.story.tsx'],
  rules: { 'no-console': 'off' },
}, storybook.configs["flat/recommended"]);
