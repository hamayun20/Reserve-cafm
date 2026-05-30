import { spawn, spawnSync } from "node:child_process";

const port = process.env.PORT || "3003";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });

  return result.status === 0;
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_PRIVATE_URL || "";
}

if (process.env.DATABASE_URL) {
  const schemaReady = run("npx", ["prisma", "db", "push"]);
  if (!schemaReady) {
    console.warn("Prisma schema push failed. Starting the app so deployment logs remain available.");
  }

  const seedReady = run("npx", ["prisma", "db", "seed"]);
  if (!seedReady) {
    console.warn("Prisma seed failed or was skipped. The app will still start.");
  }
} else {
  console.warn("No DATABASE_URL found. Starting in demo mode without database initialization.");
}

const child = spawn("npx", ["next", "start", "-p", port, "-H", "0.0.0.0"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, PORT: port, HOSTNAME: "0.0.0.0" },
});

child.on("exit", (code) => process.exit(code ?? 0));
