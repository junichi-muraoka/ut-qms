# 機能仕様書 (Functional Specifications)

Qraft は、フロントエンドからバックエンドまで一貫した品質管理環境を提供します。本ドキュメントでは、各画面の機能、API、およびデータ連携のフローを定義します。

## 1. 画面構成・UI ガイド

### 1.0 プログラム管制塔 (Program Tower) - NEW
複数システムの状況を横断的に監視・管理するための最上位ダッシュボードです。

- **システム一覧**: 各システムごとの「進捗」「不具合密度」「最終判定（Verdict）」、および「納期遅延リスク」を表示。
- **PMO フィルタ**: 管理対象の特定システムのみを絞り込み表示。

### 1.1 ダッシュボード (Standard Dashboard)
プロジェクト全体の健康状態を一目で把握するためのポータルです。
![Dashboard](./images/dashboard.png)

- **主要な指標**: Total Progress, Test Pass Rate, Open Defects.
- **可視化**: Recharts によるトレンド分析グラフ。

### 1.2 課題ボード (Task Board)
カンバン形式によるタスク管理を提供。
![Issues Board](./images/issues_board.png)

- **アクション**: ドラッグ＆ドロップによるステータス変更。

### 1.3 テスト管理 (Test Cases)
品質検証の最小単位を管理。
![Test Cases](./images/test_cases.png)

- **実行結果**: Pass, Fail, NoRun, Blocked の 4 ステート。

---

```mermaid
graph TD
    Login((ログイン)) -->|Auth| Tower[プログラム管制塔]
    Tower -->|システム選択| Dashboard[個別ダッシュボード]
    
    subgraph SystemContext [個別システムのコンテキスト]
        Dashboard -->|サイドバー| Timeline[タイムライン]
        Dashboard -->|サイドバー| Issues[課題一覧]
        Dashboard -->|サイドバー| Tests[テスト一覧]
        Dashboard -->|サイドバー| Defects[不具合一覧]
    end

    Timeline -->|依存関係参照| Tower
```

---

## 3. 統合ライフサイクル (Integrated Lifecycle)
課題・テスト・不具合がどのように連携して品質を担保するかを示します。

```mermaid
stateDiagram-v2
    [*] --> Issue_Open: 課題作成
    Issue_Open --> Issue_InProgress: 着手
    
    state "品質検証フェーズ" as QA {
        direction LR
        [*] --> Test_Execution: テスト実施
        Test_Execution --> Test_Pass: 成功
        Test_Execution --> Defect_Raised: 失敗 (不具合報告)
        Defect_Raised --> Fix_InProgress: 修正中
        Fix_InProgress --> Test_Execution: 再テスト
    }
    
    Issue_InProgress --> QA
    QA --> Issue_Done: 全テスト合格
    Issue_Done --> [*]
```

---

## 4. API 仕様 (High-Level Mapping)

Hono で実装されたバックエンドが提供する主要なエンドポイントです。

| カテゴリ | エンドポイント | メソッド | 説明 |
| :--- | :--- | :--- | :--- |
| **Test** | `/api/test-items` | GET / POST | テスト項目の一覧取得・作成 |
| **Defect** | `/api/defects` | GET / POST | 不具合の一覧取得・作成 |
| **Issue** | `/api/issues` | GET / POST | 課題の一覧取得・作成 |
| **Stats** | `/api/stats` | GET | ダッシュボード用統計データ |

---
## 🔗 関連ドキュメント
- [要件定義書 (Requirements)](./requirements.md)
- [アーキテクチャ設計 (Architecture)](../02_architecture/architecture.md)
- [ドキュメント一覧に戻る](../README.md)
