// Bunのテスト関連モジュール、プラグイン、およびElizaOSコアのロガーをインポート
import { describe, expect, it, beforeAll, afterAll, spyOn } from "bun:test";
import plugin from "../plugin";
import { logger } from "@elizaos/core";

describe("Plugin Events", () => {
  // コードベースの他のテストと同様にspyOnを使用
  beforeAll(() => {
    spyOn(logger, "info");
    spyOn(logger, "error");
    spyOn(logger, "warn");
    spyOn(logger, "debug");
  });

  it("should have events defined", () => {
    // プラグインにイベントが定義されていることを確認
    expect(plugin.events).toBeDefined();
    if (plugin.events) {
      expect(Object.keys(plugin.events).length).toBeGreaterThan(0);
    }
  });

  it("should handle MESSAGE_RECEIVED event", async () => {
    // MESSAGE_RECEIVEDイベントを処理することを確認
    if (plugin.events && plugin.events.MESSAGE_RECEIVED) {
      expect(Array.isArray(plugin.events.MESSAGE_RECEIVED)).toBe(true);
      expect(plugin.events.MESSAGE_RECEIVED.length).toBeGreaterThan(0);

      const messageHandler = plugin.events.MESSAGE_RECEIVED[0];
      expect(typeof messageHandler).toBe("function");

      // テストのために厳密な型チェックをバイパスするためにany型を使用
      const mockParams: any = {
        message: {
          id: "test-id",
          content: { text: "Hello!" },
        },
        source: "test",
        runtime: {},
      };

      // イベントハンドラを呼び出し
      await messageHandler(mockParams);

      // ロガーが正しいPinoスタイルの構造化ロギングで呼び出されたことを確認
      expect(logger.info).toHaveBeenCalledWith(
        "MESSAGE_RECEIVED event received",
      );
      expect(logger.info).toHaveBeenCalledWith(
        { keys: expect.any(Array) },
        "MESSAGE_RECEIVED param keys",
      );
    }
  });

  it("should handle VOICE_MESSAGE_RECEIVED event", async () => {
    // VOICE_MESSAGE_RECEIVEDイベントを処理することを確認
    if (plugin.events && plugin.events.VOICE_MESSAGE_RECEIVED) {
      expect(Array.isArray(plugin.events.VOICE_MESSAGE_RECEIVED)).toBe(true);
      expect(plugin.events.VOICE_MESSAGE_RECEIVED.length).toBeGreaterThan(0);

      const voiceHandler = plugin.events.VOICE_MESSAGE_RECEIVED[0];
      expect(typeof voiceHandler).toBe("function");

      // テストのために厳密な型チェックをバイパスするためにany型を使用
      const mockParams: any = {
        message: {
          id: "test-id",
          content: { text: "Voice message!" },
        },
        source: "test",
        runtime: {},
      };

      // イベントハンドラを呼び出し
      await voiceHandler(mockParams);

      // ロガーが正しいPinoスタイルの構造化ロギングで呼び出されたことを確認
      expect(logger.info).toHaveBeenCalledWith(
        "VOICE_MESSAGE_RECEIVED event received",
      );
      expect(logger.info).toHaveBeenCalledWith(
        { keys: expect.any(Array) },
        "VOICE_MESSAGE_RECEIVED param keys",
      );
    }
  });

  it("should handle WORLD_CONNECTED event", async () => {
    // WORLD_CONNECTEDイベントを処理することを確認
    if (plugin.events && plugin.events.WORLD_CONNECTED) {
      expect(Array.isArray(plugin.events.WORLD_CONNECTED)).toBe(true);
      expect(plugin.events.WORLD_CONNECTED.length).toBeGreaterThan(0);

      const connectedHandler = plugin.events.WORLD_CONNECTED[0];
      expect(typeof connectedHandler).toBe("function");

      // テストのために厳密な型チェックをバイパスするためにany型を使用
      const mockParams: any = {
        world: {
          id: "test-world-id",
          name: "Test World",
        },
        rooms: [],
        entities: [],
        source: "test",
        runtime: {},
      };

      // イベントハンドラを呼び出し
      await connectedHandler(mockParams);

      // ロガーが正しいPinoスタイルの構造化ロギングで呼び出されたことを確認
      expect(logger.info).toHaveBeenCalledWith(
        "WORLD_CONNECTED event received",
      );
      expect(logger.info).toHaveBeenCalledWith(
        { keys: expect.any(Array) },
        "WORLD_CONNECTED param keys",
      );
    }
  });

  it("should handle WORLD_JOINED event", async () => {
    // WORLD_JOINEDイベントを処理することを確認
    if (plugin.events && plugin.events.WORLD_JOINED) {
      expect(Array.isArray(plugin.events.WORLD_JOINED)).toBe(true);
      expect(plugin.events.WORLD_JOINED.length).toBeGreaterThan(0);

      const joinedHandler = plugin.events.WORLD_JOINED[0];
      expect(typeof joinedHandler).toBe("function");

      // テストのために厳密な型チェックをバイパスするためにany型を使用
      const mockParams: any = {
        world: {
          id: "test-world-id",
          name: "Test World",
        },
        entity: {
          id: "test-entity-id",
          name: "Test Entity",
        },
        rooms: [],
        entities: [],
        source: "test",
        runtime: {},
      };

      // イベントハンドラを呼び出し
      await joinedHandler(mockParams);

      // ロガーが正しいPinoスタイルの構造化ロギングで呼び出されたことを確認
      expect(logger.info).toHaveBeenCalledWith("WORLD_JOINED event received");
      expect(logger.info).toHaveBeenCalledWith(
        { keys: expect.any(Array) },
        "WORLD_JOINED param keys",
      );
    }
  });
});

