import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { $ } from "bun";

describe("Build Order Integration Test", () => {
  const rootDir = path.resolve(__dirname, "../..");
  const distDir = path.join(rootDir, "dist");
  const bunBuildMarker = path.join(distDir, "index.js");

  beforeAll(async () => {
    // Clean dist directory before test
    if (fs.existsSync(distDir)) {
      await fs.promises.rm(distDir, { recursive: true, force: true });
    }
  });

  afterAll(async () => {
    // Clean up after test
    if (fs.existsSync(distDir)) {
      await fs.promises.rm(distDir, { recursive: true, force: true });
    }
  });

  it("should ensure bun build outputs exist", async () => {
    // Run the full build process
    await $`cd ${rootDir} && bun run build`;

    // Wait for the build to complete
    let fileExists = false;
    for (let i = 0; i < 10; i++) {
      if (fs.existsSync(bunBuildMarker)) {
        fileExists = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Check that bun build output exists
    expect(fileExists).toBe(true);

    // Verify bun also produced its expected outputs
    const distFiles = fs.readdirSync(distDir);

    // Should have bun outputs (src/index.js)
    expect(distFiles.some((file) => file === "index.js")).toBe(true);
  }, 30000); // 30 second timeout for build process
});
