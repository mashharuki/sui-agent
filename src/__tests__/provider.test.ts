// Bunのテスト関連モジュール、プラグイン、ElizaOSコア、dotenvなどをインポート
import { describe, expect, it, spyOn, beforeAll, afterAll } from "bun:test";
import plugin from "../plugin";
import type { IAgentRuntime, Memory, State, Provider } from "@elizaos/core";
import { logger } from "@elizaos/core";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

// 環境変数を設定
dotenv.config();

// 問題をキャプチャするためにロギングを設定
beforeAll(() => {
  spyOn(logger, "info");
  spyOn(logger, "error");
  spyOn(logger, "warn");
  spyOn(logger, "debug");
});

afterAll(() => {
  // bun:testではグローバルなリストアは不要
});

// テスト結果を文書化するヘルパー関数
function documentTestResult(
  testName: string,
  result: any,
  error: Error | null = null,
) {
  // 開発者向けのクリーンで有用なテストドキュメンテーション
  logger.info(`✓ Testing: ${testName}`);

  if (error) {
    logger.error(`✗ Error: ${error.message}`);
    if (error.stack) {
      logger.error(`Stack: ${error.stack}`);
    }
    return;
  }

  if (result) {
    if (typeof result === "string") {
      if (result.trim() && result.length > 0) {
        const preview =
          result.length > 60 ? `${result.substring(0, 60)}...` : result;
        logger.info(`  → ${preview}`);
      }
    } else if (typeof result === "object") {
      try {
        // 主要な情報をクリーンなフォーマットで表示
        const keys = Object.keys(result);
        if (keys.length > 0) {
          const preview = keys.slice(0, 3).join(", ");
          const more = keys.length > 3 ? ` +${keys.length - 3} more` : "";
          logger.info(`  → {${preview}${more}}`);
        }
      } catch (e) {
        logger.info(`  → [Complex object]`);
      }
    }
  }
}

// テスト用のリアルなランタイムを作成
function createRealRuntime(): IAgentRuntime {
  return {
    character: {
      name: "Test Character",
      system: "You are a helpful assistant for testing.",
      plugins: [],
      settings: {},
    },
    getSetting: (key: string) => null,
    models: plugin.models,
    db: {
      get: async (key: string) => {
        return null;
      },
      set: async (key: string, value: any) => {
        return true;
      },
      delete: async (key: string) => {
        return true;
      },
      getKeys: async (pattern: string) => {
        return [];
      },
    },
    memory: {
      add: async (memory: any) => {
        // テスト用のメモリ操作
      },
      get: async (id: string) => {
        return null;
      },
      getByEntityId: async (entityId: string) => {
        return [];
      },
      getLatest: async (entityId: string) => {
        return null;
      },
      getRecentMessages: async (options: any) => {
        return [];
      },
      search: async (query: string) => {
        return [];
      },
    },
    getService: (serviceType: string) => {
      return null;
    },
  } as unknown as IAgentRuntime;
}

// リアルなメモリオブジェクトを作成
function createRealMemory(): Memory {
  const entityId = uuidv4();
  const roomId = uuidv4();

  return {
    id: uuidv4(),
    entityId,
    roomId,
    timestamp: Date.now(),
    content: {
      text: "What can you provide?",
      source: "test",
      actions: [],
    },
    metadata: {
      type: "custom",
      sessionId: uuidv4(),
      conversationId: uuidv4(),
    },
  } as Memory;
}

describe("Provider Tests", () => {
  // プロバイダー配列からHELLO_WORLD_PROVIDERを検索
  const helloWorldProvider = plugin.providers?.find(
    (provider) => provider.name === "HELLO_WORLD_PROVIDER",
  );

  describe("HELLO_WORLD_PROVIDER", () => {
    it("should exist in the plugin", () => {
      // プロバイダーがプラグインに存在することを確認
      expect(plugin.providers).toBeDefined();
      expect(Array.isArray(plugin.providers)).toBe(true);

      if (plugin.providers) {
        expect(plugin.providers.length).toBeGreaterThan(0);
        const result = plugin.providers.find(
          (p) => p.name === "HELLO_WORLD_PROVIDER",
        );
        expect(result).toBeDefined();
        documentTestResult("Provider exists check", {
          found: !!result,
          providers: plugin.providers.map((p) => p.name),
        });
      }
    });

    it("should have the correct structure", () => {
      // プロバイダーが正しい構造を持っていることを確認
      if (helloWorldProvider) {
        expect(helloWorldProvider).toHaveProperty(
          "name",
          "HELLO_WORLD_PROVIDER",
        );
        expect(helloWorldProvider).toHaveProperty("description");
        expect(helloWorldProvider).toHaveProperty("get");
        expect(typeof helloWorldProvider.get).toBe("function");

        documentTestResult("Provider structure check", {
          name: helloWorldProvider.name,
          description: helloWorldProvider.description,
          hasGetMethod: typeof helloWorldProvider.get === "function",
        });
      }
    });

    it("should have a description explaining its purpose", () => {
      // プロバイダーが目的を説明するdescriptionを持っていることを確認
      if (helloWorldProvider && helloWorldProvider.description) {
        expect(typeof helloWorldProvider.description).toBe("string");
        expect(helloWorldProvider.description.length).toBeGreaterThan(0);

        documentTestResult("Provider description check", {
          description: helloWorldProvider.description,
        });
      }
    });

    it("should return provider data from the get method", async () => {
      // getメソッドからプロバイダーデータが返されることを確認
      if (helloWorldProvider) {
        const runtime = createRealRuntime();
        const message = createRealMemory();
        const state = {
          values: { example: "test value" },
          data: { additionalContext: "some context" },
          text: "Current state context",
        } as State;

        let result: any = null;
        let error: Error | null = null;

        try {
          logger.info("Calling provider.get with real implementation");
          result = await helloWorldProvider.get(runtime, message, state);

          expect(result).toBeDefined();
          expect(result).toHaveProperty("text");
          expect(result).toHaveProperty("values");
          expect(result).toHaveProperty("data");

          // 結果の潜在的な問題をチェック
          if (result && (!result.text || result.text.length === 0)) {
            logger.warn("Provider returned empty text");
          }

          if (result && Object.keys(result.values).length === 0) {
            logger.warn("Provider returned empty values object");
          }

          if (result && Object.keys(result.data).length === 0) {
            logger.warn("Provider returned empty data object");
          }
        } catch (e) {
          error = e as Error;
          logger.error({ error: e }, "Error in provider.get:");
        }

        documentTestResult("Provider get method", result, error);
      }
    });

    it("should handle error conditions gracefully", async () => {
      // エラー条件を適切に処理することを確認
      if (helloWorldProvider) {
        const runtime = createRealRuntime();
        // エラーシナリオをシミュレートするために無効なメモリオブジェクトを作成
        const invalidMemory = {
          // 必要なプロパティが欠けている
          id: uuidv4(),
        } as unknown as Memory;

        const state = {
          values: {},
          data: {},
          text: "",
        } as State;

        let result: any = null;
        let error: Error | null = null;

        try {
          logger.info("Calling provider.get with invalid memory object");
          result = await helloWorldProvider.get(runtime, invalidMemory, state);

          // 無効な入力でもエラーをスローしないべき
          expect(result).toBeDefined();

          // 実際の無効な入力での実装の動作をログに記録
          logger.info("Provider handled invalid input without throwing");
        } catch (e) {
          error = e as Error;
          logger.error(
            { error: e },
            "Provider threw an error with invalid input:",
          );
        }

        documentTestResult("Provider error handling", result, error);
      }
    });
  });

  describe("Provider Registration", () => {
    it("should include providers in the plugin definition", () => {
      // プラグイン定義にプロバイダーが含まれていることを確認
      expect(plugin).toHaveProperty("providers");
      expect(Array.isArray(plugin.providers)).toBe(true);

      documentTestResult("Plugin providers check", {
        hasProviders: !!plugin.providers,
        providersCount: plugin.providers?.length || 0,
      });
    });

    it("should correctly initialize providers array", () => {
      // プロバイダー配列が正しく初期化されることを確認
      // プロバイダーは少なくとも1つ含む配列であるべき
      if (plugin.providers) {
        expect(plugin.providers.length).toBeGreaterThan(0);

        let allValid = true;
        const invalidProviders: string[] = [];

        // 各プロバイダーが必要な構造を持っていることを確認
        plugin.providers.forEach((provider: Provider) => {
          const isValid =
            provider.name !== undefined &&
            provider.description !== undefined &&
            typeof provider.get === "function";

          if (!isValid) {
            allValid = false;
            invalidProviders.push(provider.name || "unnamed");
          }

          expect(provider).toHaveProperty("name");
          expect(provider).toHaveProperty("description");
          expect(provider).toHaveProperty("get");
          expect(typeof provider.get).toBe("function");
        });

        documentTestResult("Provider initialization check", {
          providersCount: plugin.providers.length,
          allValid,
          invalidProviders,
        });
      }
    });

    it("should have unique provider names", () => {
      // プロバイダー名が一意であることを確認
      if (plugin.providers) {
        const providerNames = plugin.providers.map((provider) => provider.name);
        const uniqueNames = new Set(providerNames);

        const duplicates = providerNames.filter(
          (name, index) => providerNames.indexOf(name) !== index,
        );

        // 重複するプロバイダー名はないはず
        expect(providerNames.length).toBe(uniqueNames.size);

        documentTestResult("Provider uniqueness check", {
          totalProviders: providerNames.length,
          uniqueProviders: uniqueNames.size,
          duplicates,
        });
      }
    });
  });
});

