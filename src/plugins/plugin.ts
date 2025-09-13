// ElizaOSコアからプラグイン関連の型やモジュールをインポートします。
import type { Plugin } from "@elizaos/core";
import {
  type Action, // アクションの型
  type ActionResult, // アクション実行結果の型
  type Content, // メッセージ内容の型
  type GenerateTextParams, // テキスト生成パラメータの型
  type HandlerCallback, // ハンドラコールバックの型
  type IAgentRuntime, // エージェントランタイムの型
  type Memory, // メモリ（メッセージ）の型
  ModelType, // モデルタイプの列挙型
  type Provider, // プロバイダーの型
  type ProviderResult, // プロバイダー結果の型
  Service, // サービスの基底クラス
  type State, // 状態の型
  logger, // ロガー
} from "@elizaos/core";
// zodをインポートして、設定のバリデーションを行います。
import { z } from "zod";

/**
 * プラグイン設定のスキーマを定義します。
 *
 * @param {string} EXAMPLE_PLUGIN_VARIABLE - プラグイン名の例（最小長1、オプション）
 * @returns {object} - 設定スキーマオブジェクト
 */
const configSchema = z.object({
  EXAMPLE_PLUGIN_VARIABLE: z
    .string()
    .min(1, "Example plugin variable is not provided")
    .optional(),
});

/**
 * HelloWorldアクションの例です。
 * 最も単純なアクションの構造を示します。
 *
 * @typedef {Object} Action
 * @property {string} name - アクション名
 * @property {string[]} similes - 関連する同義語
 * @property {string} description - アクションの説明
 * @property {Function} validate - アクションの検証関数
 * @property {Function} handler - アクションを処理する関数
 * @property {Object[]} examples - アクションの例
 */
const helloWorldAction: Action = {
  name: "HELLO_WORLD", // アクションの一意な名前
  similes: ["GREET", "SAY_HELLO"], // 類似のアクション名
  description: "Responds with a simple hello world message", // アクションの簡単な説明

  // このアクションが実行可能かどうかを検証する関数
  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
  ): Promise<boolean> => {
    // この例では常に有効
    return true;
  },

  // アクションの本体ロジック
  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback,
    _responses: Memory[],
  ): Promise<ActionResult> => {
    try {
      logger.info("Handling HELLO_WORLD action"); // アクション処理開始のログ

      // 単純な応答内容を作成
      const responseContent: Content = {
        text: "hello world!",
        actions: ["HELLO_WORLD"],
        source: message.content.source,
      };

      // コールバックを呼び出して応答を送信
      await callback(responseContent);

      // アクションの実行結果を返す
      return {
        text: "Sent hello world greeting",
        values: {
          success: true,
          greeted: true,
        },
        data: {
          actionName: "HELLO_WORLD",
          messageId: message.id,
          timestamp: Date.now(),
        },
        success: true,
      };
    } catch (error) {
      logger.error({ error }, "Error in HELLO_WORLD action:"); // エラーログ

      // エラー発生時の実行結果を返す
      return {
        text: "Failed to send hello world greeting",
        values: {
          success: false,
          error: "GREETING_FAILED",
        },
        data: {
          actionName: "HELLO_WORLD",
          error: error instanceof Error ? error.message : String(error),
        },
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  // AIモデルへのアクションの実行例
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Can you say hello?",
        },
      },
      {
        name: "{{name2}}",
        content: {
          text: "hello world!",
          actions: ["HELLO_WORLD"],
        },
      },
    ],
  ],
};

/**
 * Hello Worldプロバイダーの例です。
 * 最も単純なプロバイダーの実装を示します。
 */
const helloWorldProvider: Provider = {
  name: "HELLO_WORLD_PROVIDER", // プロバイダーの一意な名前
  description: "A simple example provider", // プロバイダーの簡単な説明

  // データを取得する関数
  get: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
  ): Promise<ProviderResult> => {
    return {
      text: "I am a provider",
      values: {},
      data: {},
    };
  },
};

/**
 * スターターサービスのクラス定義です。
 */
export class StarterService extends Service {
  static serviceType = "starter"; // サービスタイプ
  capabilityDescription =
    "This is a starter service which is attached to the agent through the starter plugin."; // サービスの説明

  constructor(runtime: IAgentRuntime) {
    super(runtime);
  }

  // サービスを開始する静的メソッド
  static async start(runtime: IAgentRuntime) {
    logger.info("*** Starting starter service ***");
    if (runtime.getService(StarterService.serviceType)) {
      throw new Error("Starter service already registered");
    }
    const service = new StarterService(runtime);
    return service;
  }

  // サービスを停止する静的メソッド
  static async stop(runtime: IAgentRuntime) {
    logger.info("*** Stopping starter service ***");
    // ランタイムからサービスを取得
    const service = runtime.getService(StarterService.serviceType);
    if (!service) {
      throw new Error("Starter service not found");
    }
    service.stop();
  }

  // サービスインスタンスを停止するメソッド
  async stop() {
    logger.info("*** Stopping starter service instance ***");
  }
}

// プラグイン本体の定義
const plugin: Plugin = {
  name: "starter", // プラグイン名
  description: "A starter plugin for Eliza", // プラグインの説明
  // 優先度を低く設定し、実際のモデルが優先されるようにします
  priority: -1000,
  // プラグインの設定
  config: {
    EXAMPLE_PLUGIN_VARIABLE: process.env.EXAMPLE_PLUGIN_VARIABLE,
  },
  // プラグインの初期化関数
  async init(config: Record<string, string>) {
    logger.info("*** Initializing starter plugin ***");
    try {
      // 設定をバリデーション
      const validatedConfig = await configSchema.parseAsync(config);

      // 全ての環境変数を一度に設定
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value) process.env[key] = value;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid plugin configuration: ${error.errors.map((e) => e.message).join(", ")}`,
        );
      }
      throw error;
    }
  },
  // このプラグインが提供するモデル
  models: {
    // 小規模なテキストモデル（ダミー）
    [ModelType.TEXT_SMALL]: async (
      _runtime,
      { prompt, stopSequences = [] }: GenerateTextParams,
    ) => {
      return "Never gonna give you up, never gonna let you down, never gonna run around and desert you...";
    },
    // 大規模なテキストモデル（ダミー）
    [ModelType.TEXT_LARGE]: async (
      _runtime,
      {
        prompt,
        stopSequences = [],
        maxTokens = 8192,
        temperature = 0.7,
        frequencyPenalty = 0.7,
        presencePenalty = 0.7,
      }: GenerateTextParams,
    ) => {
      return "Never gonna make you cry, never gonna say goodbye, never gonna tell a lie and hurt you...";
    },
  },
  // このプラグインが提供するAPIルート
  routes: [
    {
      name: "helloworld",
      path: "/helloworld",
      type: "GET",
      handler: async (_req: any, res: any) => {
        // 応答を送信
        res.json({
          message: "Hello World!",
        });
      },
    },
  ],
  // このプラグインがリッスンするイベント
  events: {
    MESSAGE_RECEIVED: [
      async (params) => {
        logger.info("MESSAGE_RECEIVED event received");
        // パラメータのキーをログに出力
        logger.info(
          { keys: Object.keys(params) },
          "MESSAGE_RECEIVED param keys",
        );
      },
    ],
    VOICE_MESSAGE_RECEIVED: [
      async (params) => {
        logger.info("VOICE_MESSAGE_RECEIVED event received");
        // パラメータのキーをログに出力
        logger.info(
          { keys: Object.keys(params) },
          "VOICE_MESSAGE_RECEIVED param keys",
        );
      },
    ],
    WORLD_CONNECTED: [
      async (params) => {
        logger.info("WORLD_CONNECTED event received");
        // パラメータのキーをログに出力
        logger.info(
          { keys: Object.keys(params) },
          "WORLD_CONNECTED param keys",
        );
      },
    ],
    WORLD_JOINED: [
      async (params) => {
        logger.info("WORLD_JOINED event received");
        // パラメータのキーをログに出力
        logger.info({ keys: Object.keys(params) }, "WORLD_JOINED param keys");
      },
    ],
  },
  // このプラグインが提供するサービス
  services: [StarterService],
  // このプラグインが提供するアクション
  actions: [helloWorldAction],
  // このプラグインが提供するプロバイダー
  providers: [helloWorldProvider],
};

// プラグインをデフォルトエクスポート
export default plugin;
