import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    // Playwright owns tests/e2e — keep the runners separate
    exclude: ['tests/e2e/**', 'node_modules/**']
  }
})
