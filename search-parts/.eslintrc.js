require('@rushstack/eslint-config/patch/modern-module-resolution');
module.exports = {
    extends: ['@microsoft/eslint-config-spfx/lib/profiles/react'],
    parserOptions: { tsconfigRootDir: __dirname },
    rules: {
        "@microsoft/spfx/no-async-await": 0,
        "@typescript-eslint/naming-convention": 0,
        "@typescript-eslint/typedef": 0,
        "@typescript-eslint/explicit-function-return-type": 0,
        "react/jsx-no-bind": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/no-parameter-properties": [1, {
            allows: ["public"]
        }]
    }
};