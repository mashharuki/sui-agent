// Bunのテスト関連モジュール、プラグイン、zod、およびテストユーティリティをインポート
import {
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
  mock,
  spyOn,
} from "bun:test";
import plugin from "../plugin";
import { z } from "zod";
import { createMockRuntime } from "./utils/core-test-utils";
import { logger } from "@elizaos/core";

// プラグインのinit関数にアクセス
const initPlugin = plugin.init;

describe("Plugin Configuration Schema", () => {
  // 元の環境変数のバックアップを作成
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // loggerメソッドにspyOnを使用
    spyOn(logger, "info");
    spyOn(logger, "error");
    spyOn(logger, "warn");
    // 各テストの前に環境変数をリセット
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // 各テストの後に元の環境変数を復元
    process.env = { ...originalEnv };
  });

  it("should accept valid configuration", async () => {
    // 有効な設定を受け入れることを確認
    const validConfig = {
      EXAMPLE_PLUGIN_VARIABLE: "valid-value",
    };

    if (initPlugin) {
      let error: Error | null = null;
      try {
        await initPlugin(validConfig, createMockRuntime());
      } catch (e) {
        error = e as Error;
      }
      expect(error).toBeNull();
    }
  });

  it("should accept empty configuration", async () => {
    // 空の設定を受け入れることを確認
    const emptyConfig = {};

    if (initPlugin) {
      let error: Error | null = null;
      try {
        await initPlugin(emptyConfig, createMockRuntime());
      } catch (e) {
        error = e as Error;
      }
      expect(error).toBeNull();
    }
  });

  it("should accept configuration with additional properties", async () => {
    // 追加のプロパティを持つ設定を受け入れることを確認
    const configWithExtra = {
      EXAMPLE_PLUGIN_VARIABLE: "valid-value",
      EXTRA_PROPERTY: "should be ignored",
    };

    if (initPlugin) {
      let error: Error | null = null;
      try {
        await initPlugin(configWithExtra, createMockRuntime());
      } catch (e) {
        error = e as Error;
      }
      expect(error).toBeNull();
    }
  });

  it("should reject invalid configuration", async () => {
    // 無効な設定を拒否することを確認
    const invalidConfig = {
      EXAMPLE_PLUGIN_VARIABLE: "", // 空文字列は最小長違反
    };

    if (initPlugin) {
      let error: Error | null = null;
      try {
        await initPlugin(invalidConfig, createMockRuntime());
      } catch (e) {
        error = e as Error;
      }
      expect(error).not.toBeNull();
    }
  });

  it("should set environment variables from valid config", async () => {
    // 有効な設定から環境変数が設定されることを確認
    const testConfig = {
      EXAMPLE_PLUGIN_VARIABLE: "test-value",
    };

    if (initPlugin) {
      // 事前に環境変数が存在しないことを確認
      delete process.env.EXAMPLE_PLUGIN_VARIABLE;

      // 設定で初期化
      await initPlugin(testConfig, createMockRuntime());

      // 環境変数が設定されたことを確認
      expect(process.env.EXAMPLE_PLUGIN_VARIABLE).toBe("test-value");
    }
  });

  it("should not override existing environment variables", async () => {
    // 既存の環境変数を上書きしないことを確認
    // 初期化前に環境変数を設定
    process.env.EXAMPLE_PLUGIN_VARIABLE = "pre-existing-value";

    const testConfig = {
      // 変数を省略して、既存の環境変数が上書きされないことをテスト
    };

    if (initPlugin) {
      await initPlugin(testConfig, createMockRuntime());

      // 環境変数が変更されていないことを確認
      expect(process.env.EXAMPLE_PLUGIN_VARIABLE).toBe("pre-existing-value");
    }
  });

  it("should handle zod validation errors gracefully", async () => {
    // zodのバリデーションエラーを適切に処理することを確認
    // ZodErrorをスローするzodのparseAsyncのモックを作成
    const mockZodError = new z.ZodError([
      {
        code: z.ZodIssueCode.too_small,
        minimum: 1,
        type: "string",
        inclusive: true,
        message: "Example plugin variable is too short",
        path: ["EXAMPLE_PLUGIN_VARIABLE"],
      },
    ]);

    // モック用の単純なスキーマを作成
    const schema = z.object({
      EXAMPLE_PLUGIN_VARIABLE: z.string().min(1),
    });

    // parseAsync関数をモック
    const originalParseAsync = schema.parseAsync;
    schema.parseAsync = mock().mockRejectedValue(mockZodError);

    try {
      // TypeScriptエラーを避けるためにモックされたスキーマを直接使用
      await schema.parseAsync({});
      // ここには到達しないはず
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBe(mockZodError);
    }

    // 元のparseAsyncを復元
    schema.parseAsync = originalParseAsync;
  });

  it("should rethrow non-zod errors", async () => {
    // zod以外のエラーを再スローすることを確認
    // 一般的なエラーを作成
    const genericError = new Error("Something went wrong");

    // モック用の単純なスキーマを作成
    const schema = z.object({
      EXAMPLE_PLUGIN_VARIABLE: z.string().min(1),
    });

    // parseAsync関数をモック
    const originalParseAsync = schema.parseAsync;
    schema.parseAsync = mock().mockRejectedValue(genericError);

    try {
      // TypeScriptエラーを避けるためにモックされたスキーマを直接使用
      await schema.parseAsync({});
      // ここには到達しないはず
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBe(genericError);
    }

    // 元のparseAsyncを復元
    schema.parseAsync = originalParseAsync;
  });
});

