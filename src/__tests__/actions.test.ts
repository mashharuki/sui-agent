// Bunのテスト関連モジュールと、ElizaOSコア、各種ユーティリティをインポート
import { describe, expect, it, spyOn, beforeAll, afterAll } from "bun:test";
import plugin from "../plugin";
import { logger } from "@elizaos/core";
import type {
  Action,
  IAgentRuntime,
  Memory,
  State,
  HandlerCallback,
} from "@elizaos/core";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import {
  runCoreActionTests,
  documentTestResult,
  createMockRuntime,
  createMockMessage,
  createMockState,
} from "./utils/core-test-utils";

// 環境変数を設定
dotenv.config();

// ロガーをスパイして、ドキュメンテーション用のログをキャプチャ
beforeAll(() => {
  spyOn(logger, "info");
  spyOn(logger, "error");
  spyOn(logger, "warn");
});

afterAll(() => {
  // bun:testではグローバルなリストアは不要
});

describe("Actions", () => {
  // プラグインからHELLO_WORLDアクションを検索
  const helloWorldAction = plugin.actions?.find(
    (action) => action.name === "HELLO_WORLD",
  );

  // すべてのプラグインアクションに対してコアテストを実行
  it("should pass core action tests", () => {
    if (plugin.actions) {
      const coreTestResults = runCoreActionTests(plugin.actions);
      expect(coreTestResults).toBeDefined();
      expect(coreTestResults.formattedNames).toBeDefined();
      expect(coreTestResults.formattedActions).toBeDefined();
      expect(coreTestResults.composedExamples).toBeDefined();

      // コアテストの結果をドキュメント化
      documentTestResult("Core Action Tests", coreTestResults);
    }
  });

  describe("HELLO_WORLD Action", () => {
    it("should exist in the plugin", () => {
      // HELLO_WORLDアクションがプラグインに存在することを確認
      expect(helloWorldAction).toBeDefined();
    });

    it("should have the correct structure", () => {
      // HELLO_WORLDアクションが正しい構造を持つことを確認
      if (helloWorldAction) {
        expect(helloWorldAction).toHaveProperty("name", "HELLO_WORLD");
        expect(helloWorldAction).toHaveProperty("description");
        expect(helloWorldAction).toHaveProperty("similes");
        expect(helloWorldAction).toHaveProperty("validate");
        expect(helloWorldAction).toHaveProperty("handler");
        expect(helloWorldAction).toHaveProperty("examples");
        expect(Array.isArray(helloWorldAction.similes)).toBe(true);
        expect(Array.isArray(helloWorldAction.examples)).toBe(true);
      }
    });

    it("should have GREET and SAY_HELLO as similes", () => {
      // similesにGREETとSAY_HELLOが含まれていることを確認
      if (helloWorldAction) {
        expect(helloWorldAction.similes).toContain("GREET");
        expect(helloWorldAction.similes).toContain("SAY_HELLO");
      }
    });

    it("should have at least one example", () => {
      // 少なくとも1つの例が存在することを確認
      if (helloWorldAction && helloWorldAction.examples) {
        expect(helloWorldAction.examples.length).toBeGreaterThan(0);

        // 最初の例の構造を確認
        const firstExample = helloWorldAction.examples[0];
        expect(firstExample.length).toBeGreaterThan(1); // 少なくとも2つのメッセージ

        // 最初のメッセージはリクエストであるべき
        expect(firstExample[0]).toHaveProperty("name");
        expect(firstExample[0]).toHaveProperty("content");
        expect(firstExample[0].content).toHaveProperty("text");
        expect(firstExample[0].content.text).toContain("hello");

        // 2番目のメッセージはレスポンスであるべき
        expect(firstExample[1]).toHaveProperty("name");
        expect(firstExample[1]).toHaveProperty("content");
        expect(firstExample[1].content).toHaveProperty("text");
        expect(firstExample[1].content).toHaveProperty("actions");
        expect(firstExample[1].content.text).toBe("hello world!");
        expect(firstExample[1].content.actions).toContain("HELLO_WORLD");
      }
    });

    it("should return true from validate function", async () => {
      // validate関数がtrueを返すことを確認
      if (helloWorldAction) {
        const runtime = createMockRuntime();
        const mockMessage = createMockMessage("Hello!");
        const mockState = createMockState();

        let result = false;
        let error: Error | null = null;

        try {
          result = await helloWorldAction.validate(
            runtime,
            mockMessage,
            mockState,
          );
          expect(result).toBe(true);
        } catch (e) {
          error = e as Error;
          logger.error({ error: e }, "Validate function error:");
        }

        documentTestResult("HELLO_WORLD action validate", result, error);
      }
    });

    it("should call back with hello world response from handler", async () => {
      // handlerが"hello world"レスポンスでコールバックを呼び出すことを確認
      if (helloWorldAction) {
        const runtime = createMockRuntime();
        const mockMessage = createMockMessage("Hello!");
        const mockState = createMockState();

        let callbackResponse: any = {};
        let error: Error | null = null;

        const mockCallback = (response: any) => {
          callbackResponse = response;
        };

        try {
          await helloWorldAction.handler(
            runtime,
            mockMessage,
            mockState,
            {},
            mockCallback as HandlerCallback,
            [],
          );

          // コールバックが正しい内容で呼び出されたことを確認
          expect(callbackResponse).toBeTruthy();
          expect(callbackResponse).toHaveProperty("text");
          expect(callbackResponse).toHaveProperty("actions");
          expect(callbackResponse.actions).toContain("HELLO_WORLD");
          expect(callbackResponse).toHaveProperty("source", "test");
        } catch (e) {
          error = e as Error;
          logger.error({ error: e }, "Handler function error:");
        }

        documentTestResult(
          "HELLO_WORLD action handler",
          callbackResponse,
          error,
        );
      }
    });
  });
});

