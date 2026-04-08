import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, env } from "prisma/config";

const root = process.cwd();
const dotEnvLocal = resolve(root, ".env.local");
const dotEnv = resolve(root, ".env");

// Jak typowy dev Next: .env.local pierwszy; .env uzupełnia brakujące klucze (override domyślnie false).
if (existsSync(dotEnvLocal)) {
	config({ path: dotEnvLocal });
}
if (existsSync(dotEnv)) {
	config({ path: dotEnv });
}

export default defineConfig({
	schema: "prisma/schema.prisma",
	datasource: {
		url: env("DATABASE_URL"),
	},
});
