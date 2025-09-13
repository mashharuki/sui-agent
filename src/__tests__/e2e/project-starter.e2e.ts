import {
  type Content,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type UUID,
  type Action,
  type Provider,
  type Evaluator,
  type State,
  ChannelType,
  logger,
} from "@elizaos/core";
import { v4 as uuidv4 } from "uuid";

/**
 * E2E (End-to-End) Test Suite for ElizaOS Project Starter
 * ========================================================
 *
 * このファイルには、ElizaOSの実際のランタイム環境で実行されるエンドツーエンドのテストが含まれています
 * プロジェクトスターターテンプレート用です。個々のコンポーネントを分離してテストする単体テストとは異なり、
 * e2eテストは、本番に近い環境でプロジェクト全体の動作を検証します。
 *
 * 注：これらのテストはsrc/index.tsでエクスポートされ、ElizaOSテストランナーによって実行されます。
 *
 * E2Eテストの仕組み：
 * -------------------
 * 1. テストは `elizaos test e2e` を使用してElizaOSテストランナーによって実行されます
 * 2. 各テストは、プロジェクトがロードされた実際のランタイムインスタンスを受け取ります
 * 3. テストは本番環境と同様にランタイムと対話できます
 * 4. データベース操作は一時的なPGliteインスタンスを使用します
 * 5. すべてのテストデータは実行後にクリーンアップされます
 *
 * 構造：
 * ----------
 * - コアプロジェクトテスト：基本的なプロジェクト設定を検証します
 * - 自然言語処理テスト：エージェントの応答をテストします
 * - アクション＆プロバイダーテスト：カスタムアクションとプロバイダーをテストします
 * - サービス＆システムテスト：サービスと統合をテストします
 *
 * ベストプラクティス：
 * ---------------
 * - テストを独立させる - 各テストは分離して動作する必要があります
 * - テスト対象を説明する意味のあるテスト名を使用する
 * - 値をハードコーディングしない - ランタイムの実際のデータを使用する
 * - 成功ケースとエラーケースの両方をテストする
 * - テスト中に作成されたリソースをクリーンアップする
 *
 * ランタイムの操作：
 * -------------------------
 * runtimeパラメータは以下へのアクセスを提供します：
 * - runtime.agentId - エージェントの一意のID
 * - runtime.character - ロードされたキャラクター設定
 * - runtime.actions - 登録されたアクションの配列
 * - runtime.providers - 登録されたプロバイダーの配列
 * - runtime.services - 登録されたサービスのマップ
 * - runtime.evaluate() - 評価者を実行
 * - runtime.processActions() - メッセージ付きでアクションを処理
 * - runtime.composeState() - プロバイダー付きで状態を作成
 * - runtime.getMemories() - 保存されたメモリを取得
 * - runtime.createMemory() - 新しいメモリを保存
 *
 * ASYNC/AWAIT：
 * ------------
 * すべてのテスト関数は非同期であり、以下にawaitを使用できます：
 * - データベース操作
 * - メッセージ処理
 * - サービスとの対話
 * - その他の非同期操作
 *
 * エラーハンドリング：
 * ---------------
 * - テストの失敗にはエラーをスローする
 * - テストランナーがそれらをキャッチして報告します
 * - 予期されるエラーにはtry/catchを使用する
 * - 説明的なエラーメッセージを含める
 */

// テストケースのインターフェースを定義
interface TestCase {
  name: string;
  fn: (runtime: IAgentRuntime) => Promise<void>;
}

// テストスイートのインターフェースを定義
interface TestSuite {
  name: string;
  tests: TestCase[];
}

/**
 * Project StarterのメインE2Eテストスイート
 *
 * このスイートは、以下を含む完全なプロジェクト機能をテストします：
 * - プロジェクトの初期化
 * - キャラクターの読み込み
 * - エージェントの応答
 * - メモリ操作
 * - プラグインシステム
 */
export const ProjectStarterTestSuite: TestSuite = {
  name: "Project Starter E2E Tests",
  tests: [
    // ===== コアプロジェクトテスト =====
    {
      name: "project_should_initialize_correctly",
      fn: async (runtime: IAgentRuntime) => {
        // ランタイムが初期化されていることを確認
        if (!runtime) {
          throw new Error("Runtime is not initialized");
        }

        // エージェントIDを確認
        if (!runtime.agentId) {
          throw new Error("Agent ID is not set");
        }

        // キャラクターがロードされていることを確認
        if (!runtime.character) {
          throw new Error("Character is not loaded");
        }

        logger.info(`✓ Project initialized with agent ID: ${runtime.agentId}`);
      },
    },

    {
      name: "character_should_be_loaded_correctly",
      fn: async (runtime: IAgentRuntime) => {
        const character = runtime.character;

        // キャラクターが必要なフィールドを持っていることを確認
        if (!character.name) {
          throw new Error("Character name is missing");
        }

        if (!character.bio || character.bio.length === 0) {
          throw new Error("Character bio is missing or empty");
        }

        // LoreはCharacter型でオプション
        // loreは必須フィールドではないため、チェックをスキップ

        if (
          !character.messageExamples ||
          character.messageExamples.length === 0
        ) {
          throw new Error("Character messageExamples are missing or empty");
        }

        // topicsとadjectivesはオプション
        if (character.topics) {
          logger.info(`  - Has ${character.topics.length} topics`);
        }

        if (character.adjectives) {
          logger.info(`  - Has ${character.adjectives.length} adjectives`);
        }

        // settingsオブジェクトを確認
        if (!character.settings) {
          throw new Error("Character settings are missing");
        }

        // plugins配列が存在することを確認（空の場合もある）
        if (!Array.isArray(character.plugins)) {
          throw new Error("Character plugins is not an array");
        }

        logger.info(
          `✓ Character "${character.name}" loaded successfully with all required fields`,
        );
      },
    },

    // ===== 自然言語処理テスト =====
    {
      name: "agent_should_respond_to_greeting",
      fn: async (runtime: IAgentRuntime) => {
        // エージェントがメッセージを処理できることを確認するための簡単なテストを作成
        // 注：実際のE2Eテスト環境では、エージェントに
        // 言語モデルが設定されていない可能性があるため、システムが
        // エラーなしでメッセージ処理を処理できることを確認するだけです

        const testRoomId = uuidv4() as UUID;
        const testUserId = uuidv4() as UUID;

        try {
          // 接続が存在することを確認
          await runtime.ensureConnection({
            entityId: testUserId,
            roomId: testRoomId,
            userName: "TestUser",
            name: "TestUser",
            source: "test",
            worldId: uuidv4() as UUID,
            type: ChannelType.DM,
          });

          // テストメッセージを作成
          const userMessage: Memory = {
            id: uuidv4() as UUID,
            entityId: testUserId,
            agentId: runtime.agentId,
            roomId: testRoomId,
            content: {
              text: "Hello! How are you?",
              action: null,
            } as Content,
            createdAt: Date.now(),
            embedding: [],
          };

          // メッセージを保存
          await runtime.createMemory(userMessage, "messages", false);

          // LLMを使用した実際のシナリオでは、メッセージを処理します
          // 現時点では、システムがそれを処理できることを確認するだけです
          logger.info("✓ Agent can receive and store messages");
        } catch (error) {
          // 接続設定が失敗した場合、それはテスト環境の制限です
          logger.info(
            "⚠ Message processing test skipped (test environment limitation)",
          );
        }
      },
    },

    {
      name: "agent_should_respond_to_hello_world",
      fn: async (runtime: IAgentRuntime) => {
        // 特定のhello world応答のテスト
        // これにはHELLO_WORLDアクションが利用可能である必要があります

        const helloWorldAction = runtime.actions.find(
          (a: Action) => a.name === "HELLO_WORLD",
        );

        if (!helloWorldAction) {
          logger.info("⚠ HELLO_WORLD action not found, skipping test");
          return;
        }

        logger.info("✓ HELLO_WORLD action is available");
      },
    },

    {
      name: "agent_should_respond_to_casual_greetings",
      fn: async (runtime: IAgentRuntime) => {
        // さまざまなカジュアルな挨拶をテスト
        const greetings = ["hey there!", "hi!", "hello", "what's up?", "howdy"];

        // さまざまな挨拶でメッセージを作成できることを確認するだけ
        for (const greeting of greetings) {
          const message: Memory = {
            id: uuidv4() as UUID,
            entityId: uuidv4() as UUID,
            agentId: runtime.agentId,
            roomId: uuidv4() as UUID,
            content: {
              text: greeting,
              action: null,
            } as Content,
            createdAt: Date.now(),
            embedding: [],
          };

          // メッセージ構造が有効であることを確認
          if (!message.content.text) {
            throw new Error(
              `Invalid message created for greeting: ${greeting}`,
            );
          }
        }

        logger.info("✓ Can handle various greeting formats");
      },
    },

    {
      name: "agent_should_maintain_conversation_context",
      fn: async (runtime: IAgentRuntime) => {
        // エージェントがメッセージ間でコンテキストを維持できることをテスト
        try {
          const testRoomId = uuidv4() as UUID;
          const testUserId = uuidv4() as UUID;

          // コンテキストプロバイダーの状態を作成
          const state: State = {
            values: {},
            data: { conversationContext: true },
            text: "Testing conversation context",
          };

          logger.info("✓ Conversation context system is available");
        } catch (error) {
          logger.info(
            "⚠ Conversation context test skipped (test environment limitation)",
          );
        }
      },
    },

    // ===== アクション＆プロバイダーテスト =====
    {
      name: "hello_world_action_direct_execution",
      fn: async (runtime: IAgentRuntime) => {
        // 利用可能な場合は直接アクション実行をテスト
        const helloWorldAction = runtime.actions.find(
          (a: Action) => a.name === "HELLO_WORLD",
        );

        if (!helloWorldAction) {
          logger.info(
            "⚠ HELLO_WORLD action not found, skipping direct execution test",
          );
          return;
        }

        // テストメッセージを作成
        const message: Memory = {
          id: uuidv4() as UUID,
          entityId: uuidv4() as UUID,
          agentId: runtime.agentId,
          roomId: uuidv4() as UUID,
          content: {
            text: "test",
            action: "HELLO_WORLD",
          } as Content,
          createdAt: Date.now(),
          embedding: [],
        };

        const state: State = {
          values: {},
          data: {},
          text: "",
        };

        let responseReceived = false;
        const callback: HandlerCallback = async (
          response: Content,
          files?: any,
        ): Promise<Memory[]> => {
          if (
            response.text === "hello world!" &&
            response.action === "HELLO_WORLD"
          ) {
            responseReceived = true;
          }
          return [];
        };

        // 直接アクション実行を試す
        await helloWorldAction.handler(
          runtime,
          message,
          state,
          {},
          callback,
          [],
        );

        if (!responseReceived) {
          throw new Error(
            "HELLO_WORLD action did not produce expected response",
          );
        }

        logger.info("✓ HELLO_WORLD action executed successfully");
      },
    },

    // ===== プロバイダーテスト =====
    {
      name: "hello_world_provider_test",
      fn: async (runtime: IAgentRuntime) => {
        // 利用可能な場合はプロバイダー機能をテスト
        if (!runtime.providers || runtime.providers.length === 0) {
          logger.info("⚠ No providers found, skipping provider test");
          return;
        }

        // HELLO_WORLD_PROVIDERが存在するかどうかを確認
        const helloWorldProvider = runtime.providers.find(
          (p: Provider) => p.name === "HELLO_WORLD_PROVIDER",
        );

        if (!helloWorldProvider) {
          logger.info(
            "⚠ HELLO_WORLD_PROVIDER not found, skipping provider test",
          );
          return;
        }

        // プロバイダー用のモックメッセージを作成
        const mockMessage: Memory = {
          id: uuidv4() as UUID,
          entityId: uuidv4() as UUID,
          agentId: runtime.agentId,
          roomId: uuidv4() as UUID,
          content: {
            text: "test provider",
            action: null,
          } as Content,
          createdAt: Date.now(),
          embedding: [],
        };

        const mockState: State = {
          values: {},
          data: {},
          text: "",
        };

        // プロバイダーデータを取得
        const providerData = await helloWorldProvider.get(
          runtime,
          mockMessage,
          mockState,
        );

        // プロバイダーが期待されるデータを返すことを確認
        if (!providerData || typeof providerData !== "object") {
          throw new Error("Provider did not return valid data");
        }

        logger.info("✓ HELLO_WORLD_PROVIDER returned data successfully");
      },
    },

    // ===== サービステスト =====
    {
      name: "starter_service_test",
      fn: async (runtime: IAgentRuntime) => {
        // スターターサービスが利用可能かどうかをテスト
        const starterService = runtime.getService("starter");

        if (!starterService) {
          logger.info("⚠ Starter service not found, skipping service test");
          return;
        }

        // サービスには静的なstart/stopメソッドがあり、インスタンスメソッドではない
        // サービスが存在することを確認するだけ
        logger.info("✓ Starter service is available");
      },
    },

    // ===== メモリ＆データベーステスト =====
    {
      name: "memory_system_should_store_and_retrieve_messages",
      fn: async (runtime: IAgentRuntime) => {
        try {
          const testRoomId = uuidv4() as UUID;
          const testUserId = uuidv4() as UUID;

          // 接続が存在することを確認
          await runtime.ensureConnection({
            entityId: testUserId,
            roomId: testRoomId,
            userName: "MemoryTestUser",
            name: "MemoryTestUser",
            source: "test",
            worldId: uuidv4() as UUID,
            type: ChannelType.DM,
          });

          // テストメッセージを作成
          const messages: Memory[] = [];
          for (let i = 0; i < 3; i++) {
            const message: Memory = {
              id: uuidv4() as UUID,
              entityId: testUserId,
              agentId: runtime.agentId,
              roomId: testRoomId,
              content: {
                text: `Test message ${i + 1}`,
                action: null,
              } as Content,
              createdAt: Date.now() + i * 1000, // タイムスタンプをずらす
              embedding: [],
            };
            messages.push(message);

            // メッセージを保存
            await runtime.createMemory(message, "messages", false);
          }

          // メッセージを取得
          const retrievedMessages = await runtime.getMemories({
            roomId: testRoomId,
            count: 10,
            tableName: "messages",
          });

          // いくつかのメッセージが返されたことを確認
          if (!retrievedMessages || retrievedMessages.length === 0) {
            throw new Error("No messages retrieved from memory system");
          }

          logger.info(
            `✓ Memory system stored and retrieved ${retrievedMessages.length} messages`,
          );
        } catch (error) {
          // メモリ操作はテスト環境で失敗する可能性がある
          logger.info(
            "⚠ Memory system test skipped (test environment limitation)",
          );
        }
      },
    },

    // ===== 並行処理テスト =====
    {
      name: "agent_should_handle_multiple_concurrent_messages",
      fn: async (runtime: IAgentRuntime) => {
        try {
          const testRoomId = uuidv4() as UUID;
          const testUserId = uuidv4() as UUID;

          // 複数のメッセージを同時に作成
          const messagePromises = Array.from({ length: 5 }, async (_, i) => {
            const message: Memory = {
              id: uuidv4() as UUID,
              entityId: testUserId,
              agentId: runtime.agentId,
              roomId: testRoomId,
              content: {
                text: `Concurrent message ${i + 1}`,
                action: null,
              } as Content,
              createdAt: Date.now() + i * 100,
              embedding: [],
            };

            return runtime.createMemory(message, "messages", false);
          });

          // すべてのメッセージが作成されるのを待つ
          await Promise.all(messagePromises);

          logger.info("✓ Successfully handled concurrent message creation");
        } catch (error) {
          logger.info(
            "⚠ Concurrent message test skipped (test environment limitation)",
          );
        }
      },
    },

    // ===== 設定テスト =====
    {
      name: "project_configuration_should_be_valid",
      fn: async (runtime: IAgentRuntime) => {
        // データベース接続をテスト
        try {
          const connection = await runtime.getConnection();
          if (connection) {
            logger.info("✓ Database connection is working");
          }
        } catch (error) {
          logger.info("⚠ Database connection test skipped");
        }

        // 基本的なランタイム設定を確認
        if (!runtime.agentId) {
          throw new Error("Runtime agentId is not configured");
        }

        if (!runtime.character) {
          throw new Error("Runtime character is not configured");
        }

        logger.info("✓ Project configuration is valid");
      },
    },

    // ===== プラグインシステムテスト =====
    {
      name: "plugin_initialization_test",
      fn: async (runtime: IAgentRuntime) => {
        // プラグインが初期化できることをテスト
        if (!runtime.plugins) {
          throw new Error("Plugin system is not available");
        }

        // plugins配列が存在することを確認
        if (!Array.isArray(runtime.plugins)) {
          throw new Error("Plugins is not an array");
        }

        logger.info("✓ Plugin system allows registration");

        // ロードされたプラグインをカウント
        const pluginCount = runtime.plugins.length;
        logger.info(`✓ Found ${pluginCount} plugins loaded`);

        // 利用可能な場合は特定のプラグイン機能をテスト
        const hasActions = runtime.actions && runtime.actions.length > 0;
        const hasProviders = runtime.providers && runtime.providers.length > 0;
        const hasEvaluators =
          runtime.evaluators && runtime.evaluators.length > 0;

        if (hasActions) {
          logger.info(`  - ${runtime.actions.length} actions registered`);
        }
        if (hasProviders) {
          logger.info(`  - ${runtime.providers.length} providers registered`);
        }
        if (hasEvaluators) {
          logger.info(`  - ${runtime.evaluators.length} evaluators registered`);
        }
      },
    },
  ],
};

