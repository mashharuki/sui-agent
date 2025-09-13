import React from "react";
import "../../../frontend/index.css";

/**
 * アクセシブルなフォームコンポーネントの例
 */
const AccessibleForm: React.FC<{ onSubmit: (data: any) => void }> = ({
  onSubmit,
}) => {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (formData.email && !formData.email.includes("@")) {
      newErrors.email = "Please enter a valid email";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Contact Agent</h1>

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name{" "}
          <span className="text-red-500" aria-label="required">
            *
          </span>
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.name && (
          <p id="name-error" role="alert" className="text-red-500 text-sm mt-1">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email{" "}
          <span className="text-red-500" aria-label="required">
            *
          </span>
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.email && (
          <p
            id="email-error"
            role="alert"
            className="text-red-500 text-sm mt-1"
          >
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">
          Message
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          rows={4}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Send Message
      </button>
    </form>
  );
};

describe("Accessibility Tests", () => {
  describe("Form Accessibility", () => {
    it("should have proper labels for all form fields", () => {
      cy.mount(<AccessibleForm onSubmit={cy.stub()} />);

      // ラベルが正しく関連付けられていることを確認
      cy.get('label[for="name"]').should("exist");
      cy.get('label[for="email"]').should("exist");
      cy.get('label[for="message"]').should("exist");

      // 入力に一致するIDがあることを確認
      cy.get("input#name").should("exist");
      cy.get("input#email").should("exist");
      cy.get("textarea#message").should("exist");
    });

    it("should indicate required fields", () => {
      cy.mount(<AccessibleForm onSubmit={cy.stub()} />);

      // 必須フィールドインジケータを確認
      cy.get('label[for="name"]').within(() => {
        cy.get('[aria-label="required"]').should("exist");
      });
      cy.get('label[for="email"]').within(() => {
        cy.get('[aria-label="required"]').should("exist");
      });
    });

    it("should show accessible error messages", () => {
      cy.mount(<AccessibleForm onSubmit={cy.stub()} />);

      // 空のフォームを送信
      cy.get('button[type="submit"]').click();

      // エラーメッセージに適切なARIA属性があることを確認
      cy.get("#name-error").should("have.attr", "role", "alert");
      cy.get("#email-error").should("have.attr", "role", "alert");

      // 入力が無効としてマークされていることを確認
      cy.get("input#name").should("have.attr", "aria-invalid", "true");
      cy.get("input#email").should("have.attr", "aria-invalid", "true");

      // aria-describedbyがエラーを入力にリンクしていることを確認
      cy.get("input#name").should(
        "have.attr",
        "aria-describedby",
        "name-error",
      );
      cy.get("input#email").should(
        "have.attr",
        "aria-describedby",
        "email-error",
      );
    });

    it("should be keyboard navigable", () => {
      cy.mount(<AccessibleForm onSubmit={cy.stub()} />);

      // すべてのフォーム要素がフォーカスを受け取れることを確認
      cy.get("input#name").focus();
      cy.focused().should("have.attr", "id", "name");

      cy.get("input#email").focus();
      cy.focused().should("have.attr", "id", "email");

      cy.get("textarea#message").focus();
      cy.focused().should("have.attr", "id", "message");

      cy.get('button[type="submit"]').focus();
      cy.focused().should("contain", "Send Message");

      // tabindexがキーボードアクセスを妨げていないことを確認
      cy.get("input, textarea, button").should(
        "not.have.attr",
        "tabindex",
        "-1",
      );
    });

    it("should have proper focus indicators", () => {
      cy.mount(<AccessibleForm onSubmit={cy.stub()} />);

      // ボタンのフォーカスリングを確認
      cy.get('button[type="submit"]').focus();
      cy.get('button[type="submit"]').should("have.class", "focus:ring-2");
    });
  });

  describe("Color Contrast", () => {
    it("should maintain readable contrast in dark mode", () => {
      cy.mount(
        <div className="dark bg-gray-900 p-4">
          <h1 className="text-white">High Contrast Title</h1>
          <p className="text-gray-300">Body text with good contrast</p>
          <button className="bg-blue-600 text-white px-4 py-2">
            Action Button
          </button>
        </div>,
      );

      // 視覚的チェック - 実際のテストではcypress-axeを使用することがあります
      cy.get("h1").should("have.class", "text-white");
      cy.get("p").should("have.class", "text-gray-300");
    });
  });

  describe("Screen Reader Support", () => {
    it("should have proper heading hierarchy", () => {
      cy.mount(
        <article>
          <h1>Main Title</h1>
          <section>
            <h2>Section Title</h2>
            <p>Content</p>
            <h3>Subsection</h3>
            <p>More content</p>
          </section>
        </article>,
      );

      // 見出し階層を確認
      cy.get("h1").should("have.length", 1);
      cy.get("h2").should("exist");
      cy.get("h3").should("exist");
    });

    it("should use semantic HTML elements", () => {
      cy.mount(
        <nav aria-label="Main navigation">
          <ul>
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
          </ul>
        </nav>,
      );

      cy.get("nav").should("have.attr", "aria-label", "Main navigation");
      cy.get("nav ul").should("exist");
      cy.get("nav a").should("have.length", 2);
    });
  });
});

/**
 * アクセシビリティテストのパターン
 *
 * 1. ARIA属性
 *    - aria-label, aria-describedby, aria-invalidをテスト
 *    - 動的コンテンツのrole属性を検証
 *    - ライブリージョンの更新をチェック
 *
 * 2. キーボードナビゲーション
 *    - タブオーダーをテスト
 *    - すべてのインタラクティブ要素が到達可能であることを確認
 *    - フォーカスインジケータをチェック
 *
 * 3. フォームのアクセシビリティ
 *    - ラベルが入力に正しく関連付けられている
 *    - エラーメッセージがフィールドにリンクされている
 *    - 必須フィールドが示されている
 *
 * 4. カラーコントラスト
 *    - ライトモードとダークモードの両方でテスト
 *    - テキストが読みやすいことを確認
 *    - フォーカスインジケータの可視性をチェック
 *
 * 5. スクリーンリーダーのサポート
 *    - 適切な見出し階層
 *    - セマンティックHTMLの使用
 *    - 画像の代替テキスト
 *
 * 考慮すべきツール：
 * - cypress-axe：自動アクセシビリティテスト
 * - cypress-tab：より良いキーボードナビゲーションテスト
 * - cypress-real-events：実際のブラウザイベントでテスト
 */

