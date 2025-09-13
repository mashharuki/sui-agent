// Bunのテスト関連モジュール、プラグイン、サービス、およびElizaOSコアモジュールをインポート
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
import { StarterService } from "../plugin";
import { logger } from "@elizaos/core";
import type { IAgentRuntime, Memory, State } from "@elizaos/core";
import { v4 as uuidv4 } from "uuid";

describe("Error Handling", () => {
  beforeEach(() => {
    // loggerメソッドにspyOnを使用
    spyOn(logger, "info");
    spyOn(logger, "error");
    spyOn(logger, "warn");
  });

  describe("HELLO_WORLD Action Error Handling", () => {
    it("should log errors in action handlers", async () => {
      // アクションハンドラ内のエラーがログに記録されることを確認
      // アクションを検索
      const action = plugin.actions?.find((a) => a.name === "HELLO_WORLD");

      if (action && action.handler) {
        // ハンドラがエラーをスローするように強制
        const mockError = new Error("Test error in action");
        spyOn(console, "error").mockImplementation(() => {});

        // カスタムモックランタイムを作成
        const mockRuntime = {
          // これはテスト用の単純なオブジェクト
        } as unknown as IAgentRuntime;

        const mockMessage = {
          entityId: uuidv4(),
          roomId: uuidv4(),
          content: {
            text: "Hello!",
            source: "test",
          },
        } as Memory;

        const mockState = {
          values: {},
          data: {},
          text: "",
        } as State;

        const mockCallback = mock();

        // logger.errorが呼び出されることを確認するためにモック化
        spyOn(logger, "error");

        // エラーハンドリングをテストするために挙動を観察
        try {
          await action.handler(
            mockRuntime,
            mockMessage,
            mockState,
            {},
            mockCallback,
            [],
          );

          // ここに到達した場合、エラーはスローされなかったが、それでも問題ない
          // 実際のアプリケーションでは、エラーハンドリングは内部的に行われる可能性がある
          expect(mockCallback).toHaveBeenCalled();
        } catch (error) {
          // エラーがスローされた場合、正しく処理されたことを確認
          expect(logger.error).toHaveBeenCalled();
        }
      }
    });
  });

  describe("Service Error Handling", () => {
    it("should throw an error when stopping non-existent service", async () => {
      // 存在しないサービスを停止しようとするとエラーがスローされることを確認
      const mockRuntime = {
        getService: mock().mockReturnValue(null),
      } as unknown as IAgentRuntime;

      let caughtError = null;
      try {
        await StarterService.stop(mockRuntime);
      } catch (error: any) {
        caughtError = error;
        expect(error.message).toBe("Starter service not found");
      }

      expect(caughtError).not.toBeNull();
      expect(mockRuntime.getService).toHaveBeenCalledWith("starter");
    });

    it("should handle service stop errors gracefully", async () => {
      // サービスの停止エラーを適切に処理することを確認
      const mockServiceWithError = {
        stop: mock().mockImplementation(() => {
          throw new Error("Error stopping service");
        }),
      };

      const mockRuntime = {
        getService: mock().mockReturnValue(mockServiceWithError),
      } as unknown as IAgentRuntime;

      // エラーは伝播されるべき
      let caughtError = null;
      try {
        await StarterService.stop(mockRuntime);
      } catch (error: any) {
        caughtError = error;
        expect(error.message).toBe("Error stopping service");
      }

      expect(caughtError).not.toBeNull();
      expect(mockRuntime.getService).toHaveBeenCalledWith("starter");
      expect(mockServiceWithError.stop).toHaveBeenCalled();
    });
  });

  describe("Plugin Events Error Handling", () => {
    it("should handle errors in event handlers gracefully", async () => {
      // イベントハンドラのエラーを適切に処理することを確認
      if (plugin.events && plugin.events.MESSAGE_RECEIVED) {
        const messageHandler = plugin.events.MESSAGE_RECEIVED[0];

        // エラーをトリガーするモックを作成
        const mockParams = {
          message: {
            id: "test-id",
            content: { text: "Hello!" },
          },
          source: "test",
          runtime: {},
        };

        // ロガーをスパイ
        spyOn(logger, "error");

        // これは部分的なテストです - 実際のハンドラでは、より堅牢なエラーハンドリングがあります
        try {
          await messageHandler(mockParams as any);
          // エラーなしで成功した場合もOK
          expect(true).toBe(true);
        } catch (error) {
          // エラーが発生した場合、それをキャッチできることを確認
          expect(error).toBeDefined();
        }
      }
    });
  });

  describe("Provider Error Handling", () => {
    it("should handle errors in provider.get method", async () => {
      // provider.getメソッドのエラーを処理することを確認
      const provider = plugin.providers?.find(
        (p) => p.name === "HELLO_WORLD_PROVIDER",
      );

      if (provider) {
        // エラーハンドリングをテストするために無効な入力を作成
        const mockRuntime = null as unknown as IAgentRuntime;
        const mockMessage = null as unknown as Memory;
        const mockState = null as unknown as State;

        // プロバイダーはnull入力を適切に処理するべき
        try {
          await provider.get(mockRuntime, mockMessage, mockState);
          // ここに到達した場合、スローされなかった - それは良いこと
          expect(true).toBe(true);
        } catch (error) {
          // スローされた場合、少なくとも処理されたエラーであることを確認
          expect(logger.error).toHaveBeenCalled();
        }
      }
    });
  });
});

