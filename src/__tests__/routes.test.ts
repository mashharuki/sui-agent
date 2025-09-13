// Bunのテスト関連モジュールとプラグインをインポート
import { describe, expect, it, mock } from "bun:test";
import plugin from "../plugin";

describe("Plugin Routes", () => {
  it("should have routes defined", () => {
    // プラグインにルートが定義されていることを確認
    expect(plugin.routes).toBeDefined();
    if (plugin.routes) {
      expect(Array.isArray(plugin.routes)).toBe(true);
      expect(plugin.routes.length).toBeGreaterThan(0);
    }
  });

  it("should have a route for /helloworld", () => {
    // /helloworldのルートが存在することを確認
    if (plugin.routes) {
      const helloWorldRoute = plugin.routes.find(
        (route) => route.path === "/helloworld",
      );
      expect(helloWorldRoute).toBeDefined();

      if (helloWorldRoute) {
        expect(helloWorldRoute.type).toBe("GET");
        expect(typeof helloWorldRoute.handler).toBe("function");
      }
    }
  });

  it("should handle route requests correctly", async () => {
    // ルートリクエストを正しく処理することを確認
    if (plugin.routes) {
      const helloWorldRoute = plugin.routes.find(
        (route) => route.path === "/helloworld",
      );

      if (helloWorldRoute && helloWorldRoute.handler) {
        // モックのリクエストとレスポンスオブジェクトを作成
        const mockReq = {};
        const mockRes = {
          json: mock(),
        };

        // 3番目のパラメータとしてモックのランタイムオブジェクトを作成
        const mockRuntime = {} as any;

        // ルートハンドラを呼び出し
        await helloWorldRoute.handler(mockReq, mockRes, mockRuntime);

        // レスポンスを検証
        expect(mockRes.json).toHaveBeenCalledTimes(1);
        expect(mockRes.json).toHaveBeenCalledWith({
          message: "Hello World!",
        });
      }
    }
  });

  it("should validate route structure", () => {
    // ルートの構造を検証
    if (plugin.routes) {
      // 各ルートを検証
      plugin.routes.forEach((route) => {
        expect(route).toHaveProperty("path");
        expect(route).toHaveProperty("type");
        expect(route).toHaveProperty("handler");

        // pathは/で始まる文字列であるべき
        expect(typeof route.path).toBe("string");
        expect(route.path.startsWith("/")).toBe(true);

        // typeは有効なHTTPメソッドであるべき
        expect(["GET", "POST", "PUT", "DELETE", "PATCH"]).toContain(route.type);

        // handlerは関数であるべき
        expect(typeof route.handler).toBe("function");
      });
    }
  });

  it("should have unique route paths", () => {
    // ルートパスが一意であることを確認
    if (plugin.routes) {
      const paths = plugin.routes.map((route) => route.path);
      const uniquePaths = new Set(paths);
      expect(paths.length).toBe(uniquePaths.size);
    }
  });
});

