# 機能仕様書 (Functional Specifications)

## 1. 画面一覧・機能概要

### 1.1 ダッシュボード (Dashboard)
- **概要**: プロジェクト全体の健康状態（品質・進捗）を要約表示します。
- **主要な指標**:
    - **Total Progress**: チケット完了率。
    - **Test Pass Rate**: 実行済みテストのうち成功した割合。
    - **Open Defects**: 未解決の不具合数。
- **グラフ**: Progress Trend（理想線と実績線）および Quality Trend。

### 1.2 ボード画面 (Task Board)
- **表示形式**: カンバン方式（Todo / InProgress / Done / Blocked）。
- **アクション**:
    - カードのドラッグ＆ドロップによるステータス変更。
    - 新規課題のクイック追加。

### 1.3 テストケース管理画面 (Test Case List)
- **機能**:
    - テストスイートの作成・編集。
    - 実行結果の即時反映。
    - **Evidence**: 実行時のスクリーンショットや証跡の添付。

### 1.4 不具合管理画面 (Defect List)
- **機能**:
    - 重要度（Low / Medium / High / Critical）別のフィルタリング。
    - 修正サイクルのトラッキング（Investigating -> Fixed -> Verified）。

## 2. API 仕様 (High-Level Mapping)

バックエンド API は Hono で実装され、以下のエンドポイントを提供します。

| カテゴリ | エンドポイント | メソッド | 説明 |
| :--- | :--- | :--- | :--- |
| **Test** | `/api/test-items` | GET / POST | テスト項目の一覧取得・作成 |
| **Test** | `/api/test-items/:id` | GET / PUT / DELETE | 特定テスト項目の操作 |
| **Defect** | `/api/defects` | GET / POST | 不具合の一覧取得・作成 |
| **Defect** | `/api/defects/:id` | GET / PUT / DELETE | 特定不具合の操作 |
| **Issue** | `/api/issues` | GET / POST | 課題の一覧取得・作成 |
| **Stats** | `/api/stats` | GET | ダッシュボード用統計データ |
| **Trends** | `/api/trends` | GET | トレンドグラフ用時系列データ |

## 3. データ整合性ルール
- テストが `Fail` の場合、関連する `Defect` が存在することが推奨されます。
- `Issue` が `Done` になるには、関連する全ての `TestItem` が `Pass` であることが望ましい（外部バリデーション）。
