import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: "node",
					include: ["src/**/*.test.ts"],
					environment: "node",
				},
			},
			{
				extends: true,
				test: {
					name: "dom",
					include: ["src/**/*.test.tsx"],
					environment: "happy-dom",
					setupFiles: ["./vitest.setup.dom.ts"],
				},
			},
		],
	},
});
