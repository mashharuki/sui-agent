// Bunのテスト関連モジュール、Node.jsのfs、path、ElizaOSコアのロガー、およびBunのシェルユーティリティをインポート
import { describe, expect, it, beforeAll } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { logger } from "@elizaos/core";
import { $ } from "bun";

// ファイルが存在するかどうかをチェックするヘルパー関数
function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

// ディレクトリが存在するかどうかをチェックするヘルパー関数
function directoryExists(dirPath: string): boolean {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

describe("Project Structure Validation", () => {
  const rootDir = path.resolve(__dirname, "../..");

  beforeAll(async () => {
    // ビルドコマンドを実行
    await cd ${rootDir} && bun run build`;
  });

  describe("Directory Structure", () => {
    it("should have the expected directory structure", () => {
      // 期待されるディレクトリ構造を持っていることを確認
      expect(directoryExists(path.join(rootDir, "src"))).toBe(true);
      expect(directoryExists(path.join(rootDir, "src", "__tests__"))).toBe(
        true,
      );
    });

    it("should have a dist directory after building", () => {
      // ビルド後にdistディレクトリが存在することを確認
      // このテストは、テスト前にビルドが実行されていることを前提としています
      expect(directoryExists(path.join(rootDir, "dist"))).toBe(true);
    });
  });

  describe("Source Files", () => {
    it("should contain the required source files", () => {
      // 必要なソースファイルが含まれていることを確認
      expect(fileExists(path.join(rootDir, "src", "index.ts"))).toBe(true);
      expect(fileExists(path.join(rootDir, "src", "plugin.ts"))).toBe(true);
    });

    it("should have properly structured main files", () => {
      // 主要なファイルが適切に構造化されていることを確認
      // index.tsにcharacter定義が含まれていることを確認
      const indexContent = fs.readFileSync(
        path.join(rootDir, "src", "index.ts"),
        "utf8",
      );
      expect(indexContent).toContain("character");
      expect(indexContent).toContain("plugin");

      // plugin.tsにplugin定義が含まれていることを確認
      const pluginContent = fs.readFileSync(
        path.join(rootDir, "src", "plugin.ts"),
        "utf8",
      );
      expect(pluginContent).toContain("export default");
      expect(pluginContent).toContain("actions");
    });
  });

  describe("Configuration Files", () => {
    it("should have the required configuration files", () => {
      // 必要な設定ファイルが存在することを確認
      expect(fileExists(path.join(rootDir, "package.json"))).toBe(true);
      expect(fileExists(path.join(rootDir, "tsconfig.json"))).toBe(true);
      expect(fileExists(path.join(rootDir, "tsconfig.build.json"))).toBe(true);
    });

    it("should have the correct package.json configuration", () => {
      // package.jsonの設定が正しいことを確認
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, "package.json"), "utf8"),
      );

      // パッケージ名が存在し、有効であることを確認
      expect(packageJson.name).toBeTruthy();
      expect(typeof packageJson.name).toBe("string");

      // スクリプトを確認
      expect(packageJson.scripts).toHaveProperty("build");
      expect(packageJson.scripts).toHaveProperty("test");
      expect(packageJson.scripts).toHaveProperty("test:coverage");

      // 依存関係を確認
      expect(packageJson.dependencies).toHaveProperty("@elizaos/core");

      // 開発依存関係を確認 - 実際の開発依存関係に合わせて調整
      expect(packageJson.devDependencies).toBeTruthy();
      // bun testは組み込みであり、外部のテストフレームワークの依存は不要
    });

    it("should have proper TypeScript configuration", () => {
      // TypeScriptの設定が適切であることを確認
      const tsConfig = JSON.parse(
        fs.readFileSync(path.join(rootDir, "tsconfig.json"), "utf8"),
      );

      // 不可欠なコンパイラオプションを確認
      expect(tsConfig).toHaveProperty("compilerOptions");
      expect(tsConfig.compilerOptions).toHaveProperty("target");
      expect(tsConfig.compilerOptions).toHaveProperty("module");

      // パスのインクルードを確認
      expect(tsConfig).toHaveProperty("include");
    });
  });

  describe("Build Output", () => {
    it("should check for expected build output structure", () => {
      // 期待されるビルド出力構造をチェック
      // 特定のファイルを確認する代わりに、distディレクトリが存在し、
      // 少なくともいくつかのファイルが含まれていることを確認
      if (directoryExists(path.join(rootDir, "dist"))) {
        const files = fs.readdirSync(path.join(rootDir, "dist"));
        expect(files.length).toBeGreaterThan(0);

        // 特定のファイルではなく、一般的な出力パターンを確認
        const hasJsFiles = files.some((file) => file.endsWith(".js"));
        expect(hasJsFiles).toBe(true);
      } else {
        // distディレクトリがまだ存在しない場合はテストをスキップ
        logger.warn("Dist directory not found, skipping build output tests");
      }
    });

    it("should verify the build process can be executed", () => {
      // ビルドプロセスが実行可能であることを確認
      // package.jsonにbuildスクリプトが存在することを確認
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, "package.json"), "utf8"),
      );
      expect(packageJson.scripts).toHaveProperty("build");
    });
  });

  describe("Documentation", () => {
    it("should have README files", () => {
      // READMEファイルが存在することを確認
      expect(fileExists(path.join(rootDir, "README.md"))).toBe(true);
    });

    it("should have appropriate documentation content", () => {
      // ドキュメントの内容が適切であることを確認
      const readmeContent = fs.readFileSync(
        path.join(rootDir, "README.md"),
        "utf8",
      );
      expect(readmeContent).toContain("sui-agent");
    });
  });
});
