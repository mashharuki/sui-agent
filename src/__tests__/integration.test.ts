// ElizaOSコアモジュール、Node.jsのfs、os、path、およびBunのテスト関連モジュールをインポート
import { IAgentRuntime, logger, Plugin } from "@elizaos/core";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from "bun:test";
import { character } from "../index";
import plugin from "../plugin";

// ロガーにスパイを設定
beforeAll(() => {
  spyOn(logger, "info").mockImplementation(() => {});
  spyOn(logger, "error").mockImplementation(() => {});
  spyOn(logger, "warn").mockImplementation(() => {});
  spyOn(logger, "debug").mockImplementation(() => {});
});

afterAll(() => {
  // bun:testではグローバルなリストアは不要
});

// CI環境やインタラクションなしの自動テストではスキップ
const isCI = Boolean(process.env.CI);

/**
 * 統合テストは、プロジェクトの複数のコンポーネントがどのように連携して動作するかを示します。
 * 個々の関数を分離してテストする単体テストとは異なり、統合テストは
 * コンポーネントが互いにどのように相互作用するかを検証します。
 */
describe("Integration: Project Structure and Components", () => {
  it("should have a valid package structure", () => {
    // 有効なパッケージ構造を持っていることを確認
    const srcDir = path.join(process.cwd(), "src");
    expect(fs.existsSync(srcDir)).toBe(true);

    // 必要なソースファイルを確認 - コアファイルのみをチェック
    const srcFiles = [
      path.join(srcDir, "index.ts"),
      path.join(srcDir, "plugin.ts"),
    ];

    srcFiles.forEach((file) => {
      expect(fs.existsSync(file)).toBe(true);
    });
  });

  it("should have dist directory for build outputs", () => {
    // ビルド出力用のdistディレクトリがあることを確認
    const distDir = path.join(process.cwd(), "dist");

    // distがまだ存在しない場合、ディレクトリ内容の検証をスキップ
    if (!fs.existsSync(distDir)) {
      logger.warn(
        "Dist directory does not exist yet. Build the project first.",
      );
      return;
    }

    expect(fs.existsSync(distDir)).toBe(true);
  });
});

describe("Integration: Character and Plugin", () => {
  it("should have character with required properties", () => {
    // characterが必要なプロパティを持っていることを確認
    // characterが必要なプロパティを持っていることを確認
    expect(character).toHaveProperty("name");
    expect(character).toHaveProperty("plugins");
    expect(character).toHaveProperty("bio");
    expect(character).toHaveProperty("system");
    expect(character).toHaveProperty("messageExamples");

    // pluginsが配列であることを確認
    expect(Array.isArray(character.plugins)).toBe(true);
  });

  it("should configure plugin correctly", () => {
    // プラグインが正しく設定されていることを確認
    // プラグインがcharacterが使用する必要なコンポーネントを持っていることを確認
    expect(plugin).toHaveProperty("name");
    expect(plugin).toHaveProperty("description");
    expect(plugin).toHaveProperty("init");

    // characterが使用する可能性のあるアクション、モデル、プロバイダーなど、プラグインが持っているか確認
    const components = [
      "models",
      "actions",
      "providers",
      "services",
      "routes",
      "events",
    ];
    components.forEach((component) => {
      if ((plugin as any)[component]) {
        // ここではこれらの存在を確認するだけで、機能はテストしない
        // それらのテストはplugin.test.ts、actions.test.tsなどに属する
        expect(
          Array.isArray((plugin as any)[component]) ||
            typeof (plugin as any)[component] === "object",
        ).toBeTruthy();
      }
    });
  });
});

describe("Integration: Runtime Initialization", () => {
  it("should create a mock runtime with character and plugin", async () => {
    // characterとpluginを持つモックランタイムを作成することを確認
    // このテスト用にカスタムモックランタイムを作成
    const customMockRuntime = {
      character: { ...character },
      plugins: [],
      registerPlugin: mock().mockImplementation((plugin: Plugin) => {
        // 実際のランタイムでは、プラグインを登録するとそのinitメソッドが呼び出されるが、
        // init自体をテストしているので、呼び出しを記録するだけでよい
        return Promise.resolve();
      }),
      initialize: mock(),
      getService: mock(),
      getSetting: mock().mockReturnValue(null),
      useModel: mock().mockResolvedValue("Test model response"),
      getProviderResults: mock().mockResolvedValue([]),
      evaluateProviders: mock().mockResolvedValue([]),
      evaluate: mock().mockResolvedValue([]),
    } as unknown as IAgentRuntime;

    // 並列テストの競合状態を避けるために安全にテスト
    const originalInit = plugin.init;
    let initCalled = false;

    // mockを使用してplugin.initメソッドをモック化
    if (plugin.init) {
      plugin.init = mock(async (config, runtime) => {
        // ラッパーが呼び出されたことを示すフラグを設定
        initCalled = true;

        // 存在すれば元のものを呼び出す
        if (originalInit) {
          await originalInit(config, runtime);
        }

        // プラグインを登録
        await runtime.registerPlugin(plugin);
      });
    }

    try {
      // ランタイムでプラグインを初期化
      if (plugin.init) {
        await plugin.init(
          { EXAMPLE_PLUGIN_VARIABLE: "test-value" },
          customMockRuntime,
        );
      }

      // ラッパーが呼び出されたことを確認
      expect(initCalled).toBe(true);

      // registerPluginが呼び出されたことを確認
      expect(customMockRuntime.registerPlugin).toHaveBeenCalled();
    } catch (error) {
      console.error("Error initializing plugin:", error);
      throw error;
    } finally {
      // 他のテストに影響を与えないように元のinitメソッドを復元
      plugin.init = originalInit;
    }
  });
});

// ファイルシステムを変更するため、CI環境ではスキャフォールディングテストをスキップ
const describeScaffolding = isCI ? describe.skip : describe;
describeScaffolding("Integration: Project Scaffolding", () => {
  // スキャフォールディングテスト用の一時ディレクトリを作成
  const TEST_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "eliza-test-"));

  beforeAll(() => {
    // テストディレクトリが存在しない場合は作成
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    // テストディレクトリをクリーンアップ
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should scaffold a new project correctly", () => {
    // 新しいプロジェクトが正しくスキャフォールディングされることを確認
    try {
      // これはスキャフォールディングプロセスの簡単なシミュレーション
      // 実際のシナリオでは、CLIまたはAPIを使用してスキャフォールディングする

      // 不可欠なファイルをテストディレクトリにコピー
      const srcFiles = ["index.ts", "plugin.ts", "character.ts"];

      for (const file of srcFiles) {
        const sourceFilePath = path.join(process.cwd(), "src", file);
        const targetFilePath = path.join(TEST_DIR, file);

        if (fs.existsSync(sourceFilePath)) {
          fs.copyFileSync(sourceFilePath, targetFilePath);
        }
      }

      // テストディレクトリにpackage.jsonを作成
      const packageJson = {
        name: "test-project",
        version: "1.0.0",
        type: "module",
        dependencies: {
          "@elizaos/core": "workspace:*",
        },
      };

      fs.writeFileSync(
        path.join(TEST_DIR, "package.json"),
        JSON.stringify(packageJson, null, 2),
      );

      // ファイルが存在することを確認
      expect(fs.existsSync(path.join(TEST_DIR, "index.ts"))).toBe(true);
      expect(fs.existsSync(path.join(TEST_DIR, "plugin.ts"))).toBe(true);
      expect(fs.existsSync(path.join(TEST_DIR, "character.ts"))).toBe(true);
      expect(fs.existsSync(path.join(TEST_DIR, "package.json"))).toBe(true);
    } catch (error) {
      logger.error({ error }, "Error in scaffolding test:");
      throw error;
    }
  });
});

