// Bunのテスト関連モジュール、ElizaOSコア、およびプロジェクトのインデックスとプラグインをインポート
import { mock, spyOn } from "bun:test";
import { Content, IAgentRuntime, Memory, State, logger } from "@elizaos/core";
import {
  createMockRuntime as createCoreMockRuntime,
  createMockMessage as createCoreMockMessage,
  createMockState as createCoreMockState,
  documentTestResult,
  runCoreActionTests,
} from "./utils/core-test-utils";
import { character } from "../index";
import plugin from "../plugin";

/**
 * プロジェクトのキャラクターとプラグインを含む、テスト用に強化されたモックランタイムを作成します
 *
 * @param overrides - デフォルトのモックメソッドとプロパティのオプションの上書き
 * @returns テスト用のモックランタイム
 */
export function createMockRuntime(
  overrides: Partial<IAgentRuntime> = {},
): IAgentRuntime {
  // デフォルトのコアユーティリティでベースのモックランタイムを作成
  const baseRuntime = createCoreMockRuntime();

  // プロジェクト固有の設定で強化
  const mockRuntime = {
    ...baseRuntime,
    character: character,
    plugins: [plugin],
    registerPlugin: mock(),
    initialize: mock(),
    getService: mock(),
    getSetting: mock().mockReturnValue(null),
    useModel: mock().mockResolvedValue("Test model response"),
    getProviderResults: mock().mockResolvedValue([]),
    evaluateProviders: mock().mockResolvedValue([]),
    evaluate: mock().mockResolvedValue([]),
    ...overrides,
  } as unknown as IAgentRuntime;

  return mockRuntime;
}

/**
 * テスト用のモックMessageオブジェクトを作成します
 *
 * @param text - メッセージテキスト
 * @param overrides - デフォルトのメモリープロパティのオプションの上書き
 * @returns モックメモリオブジェクト
 */
export function createMockMessage(
  text: string,
  overrides: Partial<Memory> = {},
): Memory {
  const baseMessage = createCoreMockMessage(text);
  return {
    ...baseMessage,
    ...overrides,
  };
}

/**
 * テスト用のモックStateオブジェクトを作成します
 *
 * @param overrides - デフォルトの状態プロパティのオプションの上書き
 * @returns モック状態オブジェクト
 */
export function createMockState(overrides: Partial<State> = {}): State {
  const baseState = createCoreMockState();
  return {
    ...baseState,
    ...overrides,
  };
}

/**
 * 一貫したモックオブジェクトでテストするための標準化されたセットアップを作成します
 *
 * @param overrides - デフォルトのモック実装のオプションの上書き
 * @returns mockRuntime、mockMessage、mockState、およびcallbackFnを含むオブジェクト
 */
export function setupTest(
  options: {
    messageText?: string;
    messageOverrides?: Partial<Memory>;
    runtimeOverrides?: Partial<IAgentRuntime>;
    stateOverrides?: Partial<State>;
  } = {},
) {
  // モックコールバック関数を作成
  const callbackFn = mock();

  // メッセージを作成
  const mockMessage = createMockMessage(
    options.messageText || "Test message",
    options.messageOverrides || {},
  );

  // 状態オブジェクトを作成
  const mockState = createMockState(options.stateOverrides || {});

  // モックランタイムを作成
  const mockRuntime = createMockRuntime(options.runtimeOverrides || {});

  return {
    mockRuntime,
    mockMessage,
    mockState,
    callbackFn,
  };
}

// 他のユーティリティ関数をエクスポート
export { documentTestResult, runCoreActionTests };

// テストで共通して使用するためにロガーにスパイを追加
export function setupLoggerSpies() {
  spyOn(logger, "info").mockImplementation(() => {});
  spyOn(logger, "error").mockImplementation(() => {});
  spyOn(logger, "warn").mockImplementation(() => {});
  spyOn(logger, "debug").mockImplementation(() => {});

  // テストがオリジナルを復元できるようにする
  return () => mock.restore();
}
