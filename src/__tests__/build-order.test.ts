// Bunのテスト関連モジュールと、Node.jsのfs、path、およびBunのシェルユーティリティをインポート
import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { $ } from "bun";

describe("Build Order Integration Test", () => {
  // プロジェクトのルートディレクトリとdistディレクトリのパスを解決
  const rootDir = path.resolve(__dirname, "../..");
  const distDir = path.join(rootDir, "dist");
  const bunBuildMarker = path.join(distDir, "index.js");

  beforeAll(async () => {
    // テスト前にdistディレクトリをクリーンアップ
    if (fs.existsSync(distDir)) {
      await fs.promises.rm(distDir, { recursive: true, force: true });
    }
  });

  afterAll(async () => {
    // テスト後にクリーンアップ
    if (fs.existsSync(distDir)) {
      await fs.promises.rm(distDir, { recursive: true, force: true });
    }
  });

  it("should ensure bun build outputs exist", async () => {
    // 完全なビルドプロセスを実行
    await cd ${rootDir} && bun run build`;

    // ビルドが完了するのを待つ
    let fileExists = false;
    for (let i = 0; i < 10; i++) {
      if (fs.existsSync(bunBuildMarker)) {
        fileExists = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // bun buildの出力が存在することを確認
    expect(fileExists).toBe(true);

    // bunが期待される出力を生成したことも確認
    const distFiles = fs.readdirSync(distDir);

    // bunの出力（src/index.js）が含まれているべき
    expect(distFiles.some((file) => file === "index.js")).toBe(true);
  }, 30000); // ビルドプロセスのタイムアウトを30秒に設定
});

