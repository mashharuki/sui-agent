// Bunのテスト関連モジュールと、テスト対象のキャラクター設定をインポート
import { describe, expect, it } from "bun:test";
import { character } from "../index";

describe("Character Configuration", () => {
  it("should have all required fields", () => {
    // characterオブジェクトが必須フィールドを持っていることを確認
    expect(character).toHaveProperty("name");
    expect(character).toHaveProperty("bio");
    expect(character).toHaveProperty("plugins");
    expect(character).toHaveProperty("system");
    expect(character).toHaveProperty("messageExamples");
  });

  it("should have the correct name", () => {
    // nameが文字列で、空でないことを確認
    expect(typeof character.name).toBe("string");
    expect(character.name.length).toBeGreaterThan(0);
  });

  it("should have plugins defined as an array", () => {
    // pluginsが配列として定義されていることを確認
    expect(Array.isArray(character.plugins)).toBe(true);
  });

  it("should have conditionally included plugins based on environment variables", () => {
    // 環境変数に基づいてプラグインが条件付きで含まれることを確認
    // このテストは単純なプレースホルダーです。テスト環境での動的インポートのテストは難しいためです。
    // 実際の機能はスターターテストスイートによってランタイムでテストされます。

    // 元の環境変数の値を保存
    const originalOpenAIKey = process.env.OPENAI_API_KEY;
    const originalAnthropicKey = process.env.ANTHROPIC_API_KEY;

    try {
      // plugins配列にコアプラグインが含まれているか確認
      expect(character.plugins).toContain("@elizaos/plugin-sql");

      // plugins配列は環境変数に基づいて条件付きプラグインを持つべき
      if (process.env.OPENAI_API_KEY) {
        expect(character.plugins).toContain("@elizaos/plugin-openai");
      }

      if (process.env.ANTHROPIC_API_KEY) {
        expect(character.plugins).toContain("@elizaos/plugin-anthropic");
      }
    } finally {
      // 元の環境変数の値を復元
      process.env.OPENAI_API_KEY = originalOpenAIKey;
      process.env.ANTHROPIC_API_KEY = originalAnthropicKey;
    }
  });

  it("should have a non-empty system prompt", () => {
    // systemプロンプトが空でないことを確認
    expect(character.system).toBeTruthy();
    if (character.system) {
      expect(typeof character.system).toBe("string");
      expect(character.system.length).toBeGreaterThan(0);
    }
  });

  it("should have personality traits in bio array", () => {
    // bioが配列であり、人格特性が含まれていることを確認
    expect(Array.isArray(character.bio)).toBe(true);
    if (character.bio && Array.isArray(character.bio)) {
      expect(character.bio.length).toBeGreaterThan(0);
      // bioのエントリが空でない文字列であることを確認
      character.bio.forEach((trait) => {
        expect(typeof trait).toBe("string");
        expect(trait.length).toBeGreaterThan(0);
      });
    }
  });

  it("should have message examples for training", () => {
    // トレーニング用のメッセージ例があることを確認
    expect(Array.isArray(character.messageExamples)).toBe(true);
    if (character.messageExamples && Array.isArray(character.messageExamples)) {
      expect(character.messageExamples.length).toBeGreaterThan(0);

      // 最初の例の構造を確認
      const firstExample = character.messageExamples[0];
      expect(Array.isArray(firstExample)).toBe(true);
      expect(firstExample.length).toBeGreaterThan(1); // 少なくともユーザーメッセージとレスポンス

      // メッセージがnameとcontentプロパティを持っていることを確認
      firstExample.forEach((message) => {
        expect(message).toHaveProperty("name");
        expect(message).toHaveProperty("content");
        expect(message.content).toHaveProperty("text");
      });
    }
  });
});

