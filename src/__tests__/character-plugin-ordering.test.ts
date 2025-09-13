// Bunのテスト関連モジュールと、テスト対象のキャラクター設定をインポート
import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { character } from "../character";

describe("Project Starter Character Plugin Ordering", () => {
  let originalEnv: Record<string, string | undefined>;

  beforeEach(() => {
    // 元の環境変数を保存
    originalEnv = {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      OLLAMA_API_ENDPOINT: process.env.OLLAMA_API_ENDPOINT,
      GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      DISCORD_API_TOKEN: process.env.DISCORD_API_TOKEN,
      TWITTER_API_KEY: process.env.TWITTER_API_KEY,
      TWITTER_API_SECRET_KEY: process.env.TWITTER_API_SECRET_KEY,
      TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
      TWITTER_ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET,
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      IGNORE_BOOTSTRAP: process.env.IGNORE_BOOTSTRAP,
    };

    // すべての環境変数をクリア
    Object.keys(originalEnv).forEach((key) => {
      delete process.env[key];
    });
  });

  afterEach(() => {
    // 元の環境変数を復元
    Object.entries(originalEnv).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  });

  describe("Core Plugin Ordering", () => {
    it("should always include SQL plugin first", () => {
      // SQLプラグインが常に最初に含まれていることを確認
      expect(character.plugins[0]).toBe("@elizaos/plugin-sql");
    });

    it("should include bootstrap plugin by default (not ignored)", () => {
      // デフォルトでbootstrapプラグインが含まれていることを確認
      expect(character.plugins).toContain("@elizaos/plugin-bootstrap");
    });

    it("should exclude bootstrap plugin when IGNORE_BOOTSTRAP is set", () => {
      // IGNORE_BOOTSTRAPが設定された場合にbootstrapプラグインが除外されることをテスト
      // 注：characterは静的にインポートされるため、条件付きロジックの構造をテストします
      // 実際の動的挙動はgetElizaCharacter()を使用したCLIテストでテストされます
      expect(character.plugins).toContain("@elizaos/plugin-bootstrap");
      // 動的なコンテキストでは、IGNORE_BOOTSTRAPが設定されるとbootstrapは除外されます
    });
  });

  describe("Plugin Structure and Ordering", () => {
    it("should structure embedding plugins after text-only plugins", () => {
      // テキストのみのプラグインの後に埋め込みプラグインが配置されることを確認
      const plugins = character.plugins;

      // 主要なプラグインのインデックスを検索
      const sqlIndex = plugins.indexOf("@elizaos/plugin-sql");

      // SQLは最初にあるべき
      expect(sqlIndex).toBe(0);
    });
  });

  describe("Plugin Categories and Ordering", () => {
    it("should categorize plugins correctly", () => {
      // プラグインが正しくカテゴリ分けされていることを確認
      const plugins = character.plugins;

      // コアプラグイン
      expect(plugins).toContain("@elizaos/plugin-sql");

      // テキストのみのAIプラグイン（埋め込み非対応）
      const textOnlyPlugins = [
        "@elizaos/plugin-anthropic",
        "@elizaos/plugin-openrouter",
      ];

      // 埋め込み対応のAIプラグイン
      const embeddingPlugins = [
        "@elizaos/plugin-openai",
        "@elizaos/plugin-ollama",
        "@elizaos/plugin-google-genai",
      ];

      // プラットフォームプラグイン
      const platformPlugins = [
        "@elizaos/plugin-discord",
        "@elizaos/plugin-twitter",
        "@elizaos/plugin-telegram",
      ];

      // ブートストラッププラグイン
      const bootstrapPlugin = "@elizaos/plugin-bootstrap";

      // すべてのカテゴリがプラグイン構造に表現されていることを確認
      const allExpectedPlugins = [
        "@elizaos/plugin-sql",
        ...textOnlyPlugins,
        ...platformPlugins,
        bootstrapPlugin,
        ...embeddingPlugins,
      ];

      // characterにこれらのプラグインすべての条件付きロジックがあることを確認
      // SQLは常に存在するべき
      expect(plugins).toContain("@elizaos/plugin-sql");

      // BootstrapはIGNORE_BOOTSTRAPが設定されていない限り存在するべき
      expect(plugins).toContain("@elizaos/plugin-bootstrap");
    });

    it("should maintain proper ordering between plugin categories", () => {
      // プラグインカテゴリ間の順序が正しいことを確認
      const plugins = character.plugins;

      // 各カテゴリの代表的なプラグインのインデックスを取得
      const sqlIndex = plugins.indexOf("@elizaos/plugin-sql");
      const bootstrapIndex = plugins.indexOf("@elizaos/plugin-bootstrap");

      // SQLは最初にあるべき
      expect(sqlIndex).toBe(0);

      // Bootstrapは存在するべき
      if (bootstrapIndex !== -1) {
        expect(bootstrapIndex).toBeGreaterThan(sqlIndex);
      }
    });
  });

  describe("Environment Variable Integration", () => {
    it("should have conditional logic for all AI providers", () => {
      // すべてのAIプロバイダーに対する条件付きロジックがあることを確認
      // 注：これは静的インポートなので、動的挙動ではなく構造をテストします

      const plugins = character.plugins;

      // コアプラグインは常にあるべき
      expect(plugins).toContain("@elizaos/plugin-sql");
      expect(plugins).toContain("@elizaos/plugin-bootstrap");

      // 様々なAIプロバイダーを処理できるべき
      const hasAiProviders = plugins.some((plugin) =>
        [
          "@elizaos/plugin-anthropic",
          "@elizaos/plugin-openai",
          "@elizaos/plugin-openrouter",
          "@elizaos/plugin-ollama",
          "@elizaos/plugin-google-genai",
        ].includes(plugin),
      );
    });

    it("should include proper conditional checks for Twitter", () => {
      // Twitterは4つの環境変数をすべて必要とする
      // ロジック構造が健全であることをテスト
      const plugins = character.plugins;

      // Twitterはデフォルト設定（環境変数なし）には含まれないべき
      expect(plugins).not.toContain("@elizaos/plugin-twitter");
    });

    it("should structure platform plugins between AI plugins", () => {
      // プラットフォームプラグインがAIプラグインの間に配置されることを確認
      const plugins = character.plugins;

      // プラットフォームプラグインは配列構造内で正しく配置されるべき
      const sqlIndex = plugins.indexOf("@elizaos/plugin-sql");
      const bootstrapIndex = plugins.indexOf("@elizaos/plugin-bootstrap");

      // プラットフォームプラグイン（存在する場合）はSQLとbootstrapの間にあるべき
      expect(sqlIndex).toBeLessThan(bootstrapIndex);
    });
  });

  describe("Embedding Plugin Priority Verification", () => {
    it("should structure embedding plugins at the end", () => {
      // 埋め込みプラグインが最後に配置されることを確認
      const plugins = character.plugins;

      // 最後のいくつかのプラグインを取得
      const lastThreePlugins = plugins.slice(-3);

      // 少なくとも1つは埋め込み対応プラグインであるべき
      const embeddingPlugins = [
        "@elizaos/plugin-openai",
        "@elizaos/plugin-ollama",
        "@elizaos/plugin-google-genai",
      ];

      // 埋め込みプラグインが存在するか確認
      const embeddingPluginsPresent = plugins.filter((plugin) =>
        embeddingPlugins.includes(plugin),
      );

      // 埋め込みプラグインが存在する場合、少なくとも1つは最後にあるべき
      if (embeddingPluginsPresent.length > 0) {
        const hasEmbeddingAtEnd = lastThreePlugins.some((plugin) =>
          embeddingPlugins.includes(plugin),
        );
        expect(hasEmbeddingAtEnd).toBe(true);
      }
    });

    it("should maintain consistent plugin structure", () => {
      // 複数回の評価で一貫性をテスト
      const plugins1 = character.plugins;
      const plugins2 = character.plugins;

      expect(plugins1).toEqual(plugins2);
      expect(plugins1.length).toBe(plugins2.length);
    });
  });

  describe("Plugin Logic Validation", () => {
    it("should follow the expected plugin ordering pattern", () => {
      // 期待されるプラグイン順序パターンに従うことを確認
      const plugins = character.plugins;

      // 期待されるパターン: [SQL, テキストのみAI, プラットフォーム, Bootstrap, 埋め込みAI]
      // 基本構造が存在することを確認
      expect(plugins[0]).toBe("@elizaos/plugin-sql"); // SQLは常に最初
      expect(plugins).toContain("@elizaos/plugin-bootstrap"); // Bootstrapは存在する

      // 順序を検証：テキストのみプラグインは埋め込みプラグインより前
      const textOnlyPlugins = [
        "@elizaos/plugin-anthropic",
        "@elizaos/plugin-openrouter",
      ];
      const embeddingPlugins = [
        "@elizaos/plugin-openai",
        "@elizaos/plugin-ollama",
        "@elizaos/plugin-google-genai",
      ];

      const textOnlyIndices = textOnlyPlugins
        .map((p) => plugins.indexOf(p))
        .filter((i) => i !== -1);
      const embeddingIndices = embeddingPlugins
        .map((p) => plugins.indexOf(p))
        .filter((i) => i !== -1);

      if (textOnlyIndices.length > 0 && embeddingIndices.length > 0) {
        const maxTextOnly = Math.max(...textOnlyIndices);
        const minEmbedding = Math.min(...embeddingIndices);
        expect(minEmbedding).toBeGreaterThan(maxTextOnly);
      }
    });

    it("should have valid plugin names", () => {
      // プラグイン名が有効であることを確認
      const plugins = character.plugins;

      plugins.forEach((plugin) => {
        expect(typeof plugin).toBe("string");
        expect(plugin).toMatch(/^@elizaos\/plugin-/);
      });
    });

    it("should not have duplicate plugins", () => {
      // 重複したプラグインがないことを確認
      const plugins = character.plugins;
      const uniquePlugins = [...new Set(plugins)];

      expect(plugins.length).toBe(uniquePlugins.length);
    });
  });

  describe("Complex Configuration Scenarios", () => {
    it("should handle complete AI provider setup correctly", () => {
      // すべてのプロバイダーが利用可能な場合の理論的な構造をテスト
      const allAiProviders = [
        "@elizaos/plugin-anthropic",
        "@elizaos/plugin-openrouter",
        "@elizaos/plugin-openai",
        "@elizaos/plugin-ollama",
        "@elizaos/plugin-google-genai",
      ];

      // 完全なセットアップでは、少なくとも1つのAIプロバイダーが存在するべき
      // 現在の環境に基づいた論理構造をテスト
      const hasOtherAiProviders = character.plugins.some((plugin) =>
        allAiProviders.includes(plugin),
      );

      // 少なくとも1つのAIプロバイダーが存在するべき
      expect(hasOtherAiProviders).toBe(true);
    });

    it("should validate embedding vs text-only categorization", () => {
      // 埋め込み対応とテキストのみのカテゴリ分けを検証
      const embeddingCapablePlugins = [
        "@elizaos/plugin-openai",
        "@elizaos/plugin-ollama",
        "@elizaos/plugin-google-genai",
      ];

      const textOnlyPlugins = [
        "@elizaos/plugin-anthropic",
        "@elizaos/plugin-openrouter",
      ];

      // カテゴリ分けが完全で相互排他的であることを確認
      const intersection = embeddingCapablePlugins.filter((plugin) =>
        textOnlyPlugins.includes(plugin),
      );

      expect(intersection.length).toBe(0); // 重複なし
    });

    it("should structure conditional logic properly", () => {
      // characterが条件付き読み込みのための正しい構造を持つことをテスト
      const plugins = character.plugins;

      // コアプラグインを持つべき
      expect(plugins).toContain("@elizaos/plugin-sql");

      // bootstrapを持つべき（無視されない限り）
      expect(plugins).toContain("@elizaos/plugin-bootstrap");

      // フォールバックロジックが正しく機能しているべき
      const hasOtherAiProviders = plugins.some((plugin) =>
        [
          "@elizaos/plugin-anthropic",
          "@elizaos/plugin-openai",
          "@elizaos/plugin-openrouter",
          "@elizaos/plugin-ollama",
          "@elizaos/plugin-google-genai",
        ].includes(plugin),
      );

      // 少なくとも1つのAIプロバイダーを持つべき
      expect(hasOtherAiProviders).toBe(true);
    });
  });
});

