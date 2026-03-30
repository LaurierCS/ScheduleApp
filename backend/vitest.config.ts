import { defineConfig } from 'vitest/config';

export default defineConfig({
    css: {
        postcss: {
            plugins: [],
        },
    },
    test: {
        environment: 'node',
        globals: true,
        hookTimeout: 120000,
        testTimeout: 120000,
    },
});
