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
  },
  overrides: [
    {
      files: ['*.module.css', '**/*.module.css'],
      rules: {
        'selector-class-pattern': [
          '^[a-z]+((d)|([A-Z0-9][a-z0-9]+))*([A-Z])?$',
          {
            message: 'Expected class selector to be camelCase',
          },
        ],
      },
    },
  ],
};
