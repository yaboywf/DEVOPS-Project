import js from "@eslint/js";

export default [
  // Base recommended rules
  js.configs.recommended,

  {
    ignores: [
      "public/js/**",
      "html-css-test/**",
      "e2e/**",
      "playwright-report/**",
      "coverage/**",
      "generate-coverage.js",
      "generate-html-css-report.js"
    ]
  },

  // Node.js files (backend, scripts, configs)
  {
    files: [
      "index.js",
      "logger.js",
      "utils/**/*.js",
      "*.config.js",
      "generate-*.js",
      "playwright-coverage.js",
      "html-css-test/**/*.js"
    ],
    languageOptions: {
      globals: {
        require: "readonly",
        module: "readonly",
        process: "readonly",
        __dirname: "readonly",
        console: "readonly",
        URL: "readonly"
      }
    }
  },

  // Browser-side JavaScript
  {
    files: ["public/js/**/*.js"],
    languageOptions: {
      globals: {
        document: "readonly",
        window: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        confirm: "readonly",
        console: "readonly"
      }
    }
  },

  // Jest unit tests
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: {
        require: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        jest: "readonly",
        console: "readonly"
      }
    }
  },

  // Playwright / E2E tests
  {
    files: ["e2e/**/*.js"],
    languageOptions: {
      globals: {
        document: "readonly",
        Event: "readonly",
        Option: "readonly",
        console: "readonly",
        process: "readonly"
      }
    }
  }
];
