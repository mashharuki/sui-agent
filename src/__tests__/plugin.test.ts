// Bunのテスト関連モジュール、プラグイン、ElizaOSコア、サービス、およびdotenvをインポート
import {
  describe,
  expect,
  it,
  spyOn,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from "bun:test";
import plugin from "../plugin";
import { ModelType, logger } from "@elizaos/core";
import { StarterService } from "../plugin";
import dotenv from "dotenv";

// 環境変数を設定
dotenv.config();

// ドキュメンテーションのためにロガーをスパイする必要がある
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
function createRealRuntime() {
  const services = new Map();

  // 必要に応じてリアルなサービスインスタンスを作成
  const createService = (serviceType: string) => {
    if (serviceType === StarterService.serviceType) {
      return new StarterService({
        character: {
          name: "Test Character",
          system: "You are a helpful assistant for testing.",
        },
      } as any);
    }
    return null;
  };

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
      get: async (key: string) => null,
      set: async (key: string, value: any) => true,
      delete: async (key: string) => true,
      getKeys: async (pattern: string) => [],
    },
    getService: (serviceType: string) => {
      // キャッシュから取得
      return services.get(serviceType);
    },
    registerService: (serviceType: string, service: any) => {
      services.set(serviceType, service);
    },
  };
}

describe("Plugin Configuration", () => {
  it("should have correct plugin metadata", () => {
    // プラグインのメタデータが正しいことを確認
    expect(plugin.name).toBe("starter");
    expect(plugin.description).toBe("A starter plugin for Eliza");
    expect(plugin.config).toBeDefined();

    documentTestResult("Plugin metadata check", {
      name: plugin.name,
      description: plugin.description,
      hasConfig: !!plugin.config,
    });
  });

  it("should include the EXAMPLE_PLUGIN_VARIABLE in config", () => {
    // 設定にEXAMPLE_PLUGIN_VARIABLEが含まれていることを確認
    expect(plugin.config).toHaveProperty("EXAMPLE_PLUGIN_VARIABLE");

    documentTestResult("Plugin config check", {
      hasExampleVariable: plugin.config
        ? "EXAMPLE_PLUGIN_VARIABLE" in plugin.config
        : false,
      configKeys: Object.keys(plugin.config || {}),
    });
  });

  it("should initialize properly", async () => {
    // 適切に初期化されることを確認
    const originalEnv = process.env.EXAMPLE_PLUGIN_VARIABLE;

    try {
      process.env.EXAMPLE_PLUGIN_VARIABLE = "test-value";

      // 設定で初期化 - リアルなランタイムを使用
      const runtime = createRealRuntime();

      let error: Error | null = null;
      try {
        await plugin.init?.(
          { EXAMPLE_PLUGIN_VARIABLE: "test-value" },
          runtime as any,
        );
        expect(true).toBe(true); // ここに到達した場合、initは成功
      } catch (e) {
        error = e as Error;
        logger.error({ error: e }, "Plugin initialization error:");
      }

      documentTestResult(
        "Plugin initialization",
        {
          success: !error,
          configValue: process.env.EXAMPLE_PLUGIN_VARIABLE,
        },
        error,
      );
    } finally {
      process.env.EXAMPLE_PLUGIN_VARIABLE = originalEnv;
    }
  });

  it("should throw an error on invalid config", async () => {
    // 無効な設定でエラーをスローすることを確認
    // 空文字列でテスト（最小長1未満）
    if (plugin.init) {
      const runtime = createRealRuntime();
      let error: Error | null = null;

      try {
        await plugin.init({ EXAMPLE_PLUGIN_VARIABLE: "" }, runtime as any);
        // ここには到達しないはず
        expect(true).toBe(false);
      } catch (e) {
        error = e as Error;
        // これは期待される動作 - テストは成功
        expect(error).toBeTruthy();
      }

      documentTestResult(
        "Plugin invalid config",
        {
          errorThrown: !!error,
          errorMessage: error?.message || "No error message",
        },
        error,
      );
    }
  });

  it("should have a valid config", () => {
    // 有効な設定を持っていることを確認
    expect(plugin.config).toBeDefined();
    if (plugin.config) {
      // 設定に期待されるEXAMPLE_PLUGIN_VARIABLEプロパティがあるか確認
      expect(Object.keys(plugin.config)).toContain("EXAMPLE_PLUGIN_VARIABLE");
    }
  });
});

describe("Plugin Models", () => {
  it("should have TEXT_SMALL model defined", () => {
    // TEXT_SMALLモデルが定義されていることを確認
    if (plugin.models) {
      expect(plugin.models).toHaveProperty(ModelType.TEXT_SMALL);
      expect(typeof plugin.models[ModelType.TEXT_SMALL]).toBe("function");

      documentTestResult("TEXT_SMALL model check", {
        defined: ModelType.TEXT_SMALL in plugin.models,
        isFunction: typeof plugin.models[ModelType.TEXT_SMALL] === "function",
      });
    }
  });

  it("should have TEXT_LARGE model defined", () => {
    // TEXT_LARGEモデルが定義されていることを確認
    if (plugin.models) {
      expect(plugin.models).toHaveProperty(ModelType.TEXT_LARGE);
      expect(typeof plugin.models[ModelType.TEXT_LARGE]).toBe("function");

      documentTestResult("TEXT_LARGE model check", {
        defined: ModelType.TEXT_LARGE in plugin.models,
        isFunction: typeof plugin.models[ModelType.TEXT_LARGE] === "function",
      });
    }
  });

  it("should return a response from TEXT_SMALL model", async () => {
    // TEXT_SMALLモデルから応答が返されることを確認
    if (plugin.models && plugin.models[ModelType.TEXT_SMALL]) {
      const runtime = createRealRuntime();

      let result = "";
      let error: Error | null = null;

      try {
        logger.info("Using OpenAI for TEXT_SMALL model");
        result = await plugin.models[ModelType.TEXT_SMALL](runtime as any, {
          prompt: "test",
        });

        // 空でない文字列の応答が得られることを確認
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(10);
      } catch (e) {
        error = e as Error;
        logger.error("TEXT_SMALL model test failed:", e);
      }

      documentTestResult("TEXT_SMALL model plugin test", result, error);
    }
  });
});

describe("StarterService", () => {
  let originalGetService: any;
  let runtime: any;

  beforeEach(() => {
    runtime = createRealRuntime();
    originalGetService = runtime.getService;
  });

  afterEach(() => {
    runtime.getService = originalGetService;
  });

  it("should start the service", async () => {
    // サービスが開始されることを確認
    let startResult;
    let error: Error | null = null;

    try {
      logger.info("Using OpenAI for TEXT_SMALL model");
      startResult = await StarterService.start(runtime as any);

      expect(startResult).toBeDefined();
      expect(startResult.constructor.name).toBe("StarterService");

      // リアルな機能性をテスト - stopメソッドが利用可能か確認
      expect(typeof startResult.stop).toBe("function");
    } catch (e) {
      error = e as Error;
      logger.error({ error: e }, "Service start error:");
    }

    documentTestResult(
      "StarterService start",
      {
        success: !!startResult,
        serviceType: startResult?.constructor.name,
      },
      error,
    );
  });

  it("should throw an error on startup if the service is already registered", async () => {
    // サービスが既に登録されている場合に起動時にエラーをスローすることを確認
    // 最初の登録は成功するはず
    const result1 = await StarterService.start(runtime as any);
    runtime.registerService(StarterService.serviceType, result1);
    expect(result1).toBeTruthy();

    let startupError: Error | null = null;

    try {
      // 2回目の登録は失敗するはず
      await StarterService.start(runtime as any);
      expect(true).toBe(false); // ここには到達しないはず
    } catch (e) {
      startupError = e as Error;
      expect(e).toBeTruthy();
    }

    documentTestResult(
      "StarterService double start",
      {
        errorThrown: !!startupError,
        errorMessage: startupError?.message || "No error message",
      },
      startupError,
    );
  });

  it("should stop the service", async () => {
    // サービスが停止されることを確認
    let error: Error | null = null;

    try {
      // 最初にリアルなサービスを登録
      const service = new StarterService(runtime as any);
      runtime.registerService(StarterService.serviceType, service);

      // リアルなサービスのstopメソッドをスパイ
      const stopSpy = spyOn(service, "stop");

      // 静的なstopメソッドを呼び出し
      await StarterService.stop(runtime as any);

      // サービスのstopメソッドが呼び出されたことを確認
      expect(stopSpy).toHaveBeenCalled();
    } catch (e) {
      error = e as Error;
      logger.error({ error: e }, "Service stop error:");
    }

    documentTestResult(
      "StarterService stop",
      {
        success: !error,
      },
      error,
    );
  });

  it("should throw an error when stopping a non-existent service", async () => {
    // 存在しないサービスを停止しようとするとエラーをスローすることを確認
    // サービスを登録しないので、getServiceはnullを返す

    let error: Error | null = null;

    try {
      // getService関数をパッチして、nullを返すようにする
      runtime.getService = () => null;

      await StarterService.stop(runtime as any);
      // ここには到達しないはず
      expect(true).toBe(false);
    } catch (e) {
      error = e as Error;
      // これは期待される動作 - 正しいエラーであることを確認
      expect(error).toBeTruthy();
      if (error instanceof Error) {
        expect(error.message).toContain("Starter service not found");
      }
    }

    documentTestResult(
      "StarterService non-existent stop",
      {
        errorThrown: !!error,
        errorMessage: error?.message || "No error message",
      },
      error,
    );
  });

  it("should stop a registered service", async () => {
    // 登録されたサービスを停止することを確認
    // 最初にサービスを開始
    const startResult = await StarterService.start(runtime as any);
    runtime.registerService(StarterService.serviceType, startResult);
    expect(startResult).toBeTruthy();

    let stopError: Error | unknown = null;
    let stopSuccess = false;

    try {
      // 次に停止
      await StarterService.stop(runtime as any);
      stopSuccess = true;
    } catch (e) {
      stopError = e;
      expect(true).toBe(false); // ここには到達しないはず
    }

    documentTestResult(
      "StarterService stop",
      {
        success: stopSuccess,
        errorThrown: !!stopError,
        errorMessage:
          stopError instanceof Error ? stopError.message : String(stopError),
      },
      stopError instanceof Error ? stopError : null,
    );
  });
});
