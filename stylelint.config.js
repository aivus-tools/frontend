'use strict';
module.exports = {
  plugins: ['stylelint-scss'],
  extends: [
    'stylelint-config-standard',
    'stylelint-config-sass-guidelines',
    'stylelint-config-recess-order',
    'stylelint-config-css-modules',
  ],
  rules: {
    'selector-class-pattern': null,
    'selector-no-qualifying-type': null,
  },
  overrides: [
    {
      files: ['**/*.module.css'],
      rules: {
        'color-no-hex': [
          true,
          {
            message:
              'Hardcoded hex color is forbidden in .module.css. Use var(--token) from globals.css or a domain CSS variable. Theme tokens live in Frontend/src/lib/themeConfig.ts and are mirrored as CSS aliases in globals.css.',
          },
        ],
      },
    },
    {
      files: [
        '**/BetaBadge/BetaBadge.module.css',
        '**/BetaFooter/BetaFooter.module.css',
      ],
      rules: {
        'color-no-hex': null,
      },
    },
    {
      files: ['**/globals.css'],
      rules: {
        'color-no-hex': null,
      },
    },
  ],
};
