// Node.jsのpathおよびfsモジュールをインポート
import path from "node:path";
import fs from "node:fs";

/**
 * vite.config.tsからViteのbuild.outDirを抽出します。
 * Viteのルートディレクトリを考慮して、相対パスと絶対パスの両方を処理します。
 */
export async function getViteOutDir(packageRoot: string): Promise<string> {
  const viteConfigPath = path.join(packageRoot, "vite.config.ts");

  if (!fs.existsSync(viteConfigPath)) {
    throw new Error(`vite.config.ts not found at ${viteConfigPath}`);
  }

  // Vite設定を動的にインポート
  const configModule = await import(viteConfigPath);
  const config =
    typeof configModule.default === "function"
      ? configModule.default({ command: "build", mode: "production" })
      : configModule.default;

  let outDir = config.build?.outDir || "dist";
  const viteRoot = config.root || ".";

  // outDirが相対パスの場合、Viteルートからの相対パスとして解決
  if (!path.isAbsolute(outDir)) {
    const viteRootAbsolute = path.resolve(packageRoot, viteRoot);
    outDir = path.resolve(viteRootAbsolute, outDir);
  }

  // 一貫性のために、パスをpackageRootからの相対パスにする
  return path.relative(packageRoot, outDir);
}
