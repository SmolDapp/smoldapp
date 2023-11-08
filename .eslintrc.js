module.exports = {
	extends: [
		'./node_modules/@yearn-finance/web-lib/.eslintrc.cjs',
		'plugin:@next/next/recommended',
		'prettier',
		'plugin:react-hooks/recommended'
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true
		},
		tsconfigRootDir: __dirname,
		ecmaVersion: 2022,
		sourceType: 'module',
		project: ['./tsconfig.json']
	},
	rules: {
		'@typescript-eslint/prefer-optional-chain': 'error',
		indent: 'off',
		'@typescript-eslint/explicit-function-return-type': [
			'error',
			{
				allowExpressions: true,
				allowTypedFunctionExpressions: true
			}
		],
		'no-multi-spaces': ['error', {ignoreEOLComments: false}],
		'@typescript-eslint/indent': 0,
		'@typescript-eslint/consistent-type-assertions': 0,
		'no-mixed-spaces-and-tabs': ['warn', 'smart-tabs'],
		'object-curly-newline': [
			'error',
			{
				ObjectExpression: {multiline: true, consistent: true},
				ObjectPattern: {multiline: true, consistent: true},
				ImportDeclaration: {multiline: true, consistent: true},
				ExportDeclaration: {multiline: true, minProperties: 3}
			}
		],
		'react-hooks/exhaustive-deps': [
			'warn',
			{
				additionalHooks: '(^useAsyncTrigger$|^useDeepCompareMemo$)'
			}
		]
	}
};
