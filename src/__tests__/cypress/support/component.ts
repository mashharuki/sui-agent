// ***********************************************************
// このファイルは、テストファイルの前に自動的に処理およびロードされます。
// このファイルの場所を変更したり、'supportFile'設定オプションを使用して
// 処理をオフにしたりできます。
// ***********************************************************

// ES2015構文を使用してcommands.jsをインポート：
import "./commands";

// Testing Library Cypressコマンドをインポート
import "@testing-library/cypress/add-commands";

// スタイルをインポート
import "../../../frontend/index.css";

// カスタムTypeScript型を追加
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Reactコンポーネントをマウントするカスタムコマンド
       * @example cy.mount(<Component />)
       */
      mount(component: React.ReactElement): Chainable<any>;
    }
  }
}

// Reactマウント関数をインポート
import { mount } from "@cypress/react";

// マウントをグローバルに利用可能にする
Cypress.Commands.add("mount", mount);

