// eslint-disable-next-line
module.exports = {
  parser: '@typescript-eslint/parser',  // Specifies the ESLint parser
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from the @typescript-eslint/eslint-plugin
  ],
  parserOptions: {
    ecmaVersion: 2020,  // Allows for the parsing of modern ECMAScript features
    sourceType: 'module',  // Allows for the use of imports
  },
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
  },
  overrides: [
    {
      files: ["src/__tests__/*.ts"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off"
      }
    }
  ]
};
