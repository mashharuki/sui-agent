// Node.jsのfs、pathモジュールと、Bunのテスト関連モジュールをインポート
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "bun:test";

describe("Environment Setup", () => {
  it("should verify configuration files exist", () => {
    // 必須の設定ファイルが存在することを確認
    const requiredFiles = [
      "package.json",
      "tsconfig.json",
      "tsconfig.build.json",
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(process.cwd(), file);
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });

  it("should have proper src directory structure", () => {
    // srcディレクトリ構造が正しいことを確認
    const srcDir = path.join(process.cwd(), "src");
    expect(fs.existsSync(srcDir)).toBe(true);

    const requiredSrcFiles = ["index.ts", "plugin.ts"];

    for (const file of requiredSrcFiles) {
      const filePath = path.join(srcDir, file);
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });

  it("should have a valid package.json with required fields", () => {
    // package.jsonが有効で、必須フィールドが含まれていることを確認
    const packageJsonPath = path.join(process.cwd(), "package.json");
    expect(fs.existsSync(packageJsonPath)).toBe(true);

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    expect(packageJson).toHaveProperty("name");
    expect(typeof packageJson.name).toBe("string");
    expect(packageJson.name.length).toBeGreaterThan(0);
    expect(packageJson).toHaveProperty("version");
    expect(packageJson).toHaveProperty("type", "module");
    expect(packageJson).toHaveProperty("main");
    expect(packageJson).toHaveProperty("module");
    expect(packageJson).toHaveProperty("types");
    expect(packageJson).toHaveProperty("dependencies");
    expect(packageJson).toHaveProperty("devDependencies");
    expect(packageJson).toHaveProperty("scripts");

    // 必須の依存関係を確認
    expect(packageJson.dependencies).toHaveProperty("@elizaos/core");

    // 必須のスクリプトを確認
    expect(packageJson.scripts).toHaveProperty("build");
    expect(packageJson.scripts).toHaveProperty("test");
  });

  it("should have a valid tsconfig.json with required configuration", () => {
    // tsconfig.jsonが有効で、必須の設定が含まれていることを確認
    const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
    expect(fs.existsSync(tsconfigPath)).toBe(true);

    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
    expect(tsconfig).toHaveProperty("compilerOptions");

    // コンパイラオプションを確認
    expect(tsconfig.compilerOptions).toHaveProperty("target");
    expect(tsconfig.compilerOptions).toHaveProperty("module");
    expect(tsconfig.compilerOptions).toHaveProperty("moduleResolution");
    expect(tsconfig.compilerOptions).toHaveProperty("esModuleInterop");
  });

  

  it("should have a valid README.md file", () => {
    // README.mdファイルが有効であることを確認
    const readmePath = path.join(process.cwd(), "README.md");
    expect(fs.existsSync(readmePath)).toBe(true);

    const readme = fs.readFileSync(readmePath, "utf8");
    expect(readme).toContain("# sui-agent");
  });
});

