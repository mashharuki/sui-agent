// Bunのテスト関連モジュール、プラグイン、ElizaOSコア、dotenv、およびテストユーティリティをインポート
import { describe, expect, it, spyOn, beforeAll, afterAll } from "bun:test";
import plugin from "../plugin";
import { ModelType, logger } from "@elizaos/core";
import type { IAgentRuntime } from "@elizaos/core";
import dotenv from "dotenv";
import { documentTestResult, createMockRuntime } from "./utils/core-test-utils";

// テスト用のGenerateTextParamsの簡略版を定義
interface TestGenerateParams {
  prompt: string;
  stopSequences?: string[];
  maxTokens?: number;
  temperature?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

// .envファイルから環境変数を設定
dotenv.config();

// ドキュメンテーション用のログをキャプチャするためにロガーをスパイ
beforeAll(() => {
  spyOn(logger, "info");
  spyOn(logger, "error");
  spyOn(logger, "warn");
});

afterAll(() => {
  // bun:testではグローバルなリストアは不要
});

/**
 * コアテストパターンでモデル関数をテストします
 * @param modelType テストするモデルのタイプ
 * @param modelFn テストするモデル関数
 */
const runCoreModelTests = async (
  modelType: keyof typeof ModelType,
  modelFn: (
    runtime: IAgentRuntime,
    params: TestGenerateParams,
  ) => Promise<string>,
) => {
  // モデルテスト用のモックランタイムを作成
  const mockRuntime = createMockRuntime();

  // 基本的なパラメータでテスト
  const basicParams: TestGenerateParams = {
    prompt: `Test prompt for ${modelType}`,
    stopSequences: ["STOP"],
    maxTokens: 100,
  };

  let basicResponse: string | null = null;
  let basicError: Error | null = null;

  try {
    basicResponse = await modelFn(mockRuntime, basicParams);
    expect(basicResponse).toBeTruthy();
    expect(typeof basicResponse).toBe("string");
  } catch (e) {
    basicError = e as Error;
    logger.error({ error: e }, `${modelType} model call failed:`);
  }

  // 空のプロンプトでテスト
  const emptyParams: TestGenerateParams = {
    prompt: "",
  };

  let emptyResponse: string | null = null;
  let emptyError: Error | null = null;

  try {
    emptyResponse = await modelFn(mockRuntime, emptyParams);
  } catch (e) {
    emptyError = e as Error;
    logger.error({ error: e }, `${modelType} empty prompt test failed:`);
  }

  // すべてのパラメータでテスト
  const fullParams: TestGenerateParams = {
    prompt: `Comprehensive test prompt for ${modelType}`,
    stopSequences: ["STOP1", "STOP2"],
    maxTokens: 200,
    temperature: 0.8,
    frequencyPenalty: 0.6,
    presencePenalty: 0.4,
  };

  let fullResponse: string | null = null;
  let fullError: Error | null = null;

  try {
    fullResponse = await modelFn(mockRuntime, fullParams);
  } catch (e) {
    fullError = e as Error;
    logger.error({ error: e }, `${modelType} all parameters test failed:`);
  }

  return {
    basic: { response: basicResponse, error: basicError },
    empty: { response: emptyResponse, error: emptyError },
    full: { response: fullResponse, error: fullError },
  };
};

describe("Plugin Models", () => {
  it("should have models defined", () => {
    // プラグインにモデルが定義されていることを確認
    expect(plugin.models).toBeDefined();
    if (plugin.models) {
      expect(typeof plugin.models).toBe("object");
    }
  });

  describe("TEXT_SMALL Model", () => {
    it("should have a TEXT_SMALL model defined", () => {
      // TEXT_SMALLモデルが定義されていることを確認
      if (plugin.models) {
        expect(plugin.models).toHaveProperty(ModelType.TEXT_SMALL);
        expect(typeof plugin.models[ModelType.TEXT_SMALL]).toBe("function");
      }
    });

    it("should run core tests for TEXT_SMALL model", async () => {
      // TEXT_SMALLモデルのコアテストを実行
      if (plugin.models && plugin.models[ModelType.TEXT_SMALL]) {
        const results = await runCoreModelTests(
          ModelType.TEXT_SMALL,
          plugin.models[ModelType.TEXT_SMALL],
        );

        documentTestResult("TEXT_SMALL core model tests", results);
      }
    });
  });

  describe("TEXT_LARGE Model", () => {
    it("should have a TEXT_LARGE model defined", () => {
      // TEXT_LARGEモデルが定義されていることを確認
      if (plugin.models) {
        expect(plugin.models).toHaveProperty(ModelType.TEXT_LARGE);
        expect(typeof plugin.models[ModelType.TEXT_LARGE]).toBe("function");
      }
    });

    it("should run core tests for TEXT_LARGE model", async () => {
      // TEXT_LARGEモデルのコアテストを実行
      if (plugin.models && plugin.models[ModelType.TEXT_LARGE]) {
        const results = await runCoreModelTests(
          ModelType.TEXT_LARGE,
          plugin.models[ModelType.TEXT_LARGE],
        );

        documentTestResult("TEXT_LARGE core model tests", results);
      }
    });
  });
});

