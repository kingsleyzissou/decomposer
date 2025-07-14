export default {
  trailingComma: 'all',
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  importOrder: [
    '^@app/(.*)$|^@generated/(.*)$',
    '^@fixtures$|^@mocks$',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  // this sorts the import statements for us, so we
  // don't have to handle this manually
  plugins: ['@trivago/prettier-plugin-sort-imports'],
};
