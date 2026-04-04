# データベース設計書 (Database Schema Design)

Qraft のデータモデルは、Cloudflare D1 (SQLite) を基盤とし、Drizzle ORM を用いて型安全に管理されています。

## 1. エンティティ概要

システムは主に以下の 3 つのコア・テーブルで構成されています。

1.  **test_items (テスト項目)**: テストの設計と実行結果を管理。
2.  **defects (欠陥)**: 発見されたバグとその修正状況を管理。
3.  **issues (課題)**: 開発タスクそのものを管理。

---

## 2. テーブル定義詳細

### 2.1 test_items (テスト項目)
テストのシナリオと、最新の実行状態を保持します。

| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | text | PK | 一意識別子 (UUID等) |
| `title` | text | NOT NULL | テスト項目のタイトル |
| `description` | text | - | テストの目的・詳細 |
| `precondition` | text | - | テスト実行前の前提条件 |
| `expected_result`| text | NOT NULL | 期待される結果 |
| `status` | text | Default: 'NoRun' | 実行状態 (NoRun, Pass, Fail, Blocked) |
| `evidence` | text | - | 証跡（画像URLやパスなど） |
| `defect_id` | text | FK (optional) | 関連する欠陥ID |
| `updated_at` | integer | NOT NULL | 最終更新日時 (Timestamp) |

### 2.2 defects (欠陥)
テスト失敗時などに報告される不具合情報です。

| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | text | PK | 一意識別子 |
| `title` | text | NOT NULL | 不具合の要約 |
| `description` | text | NOT NULL | 現象の詳細 |
| `priority` | text | NOT NULL | 優先度 (Low, Medium, High, Critical) |
| `status` | text | Default: 'Open' | 状態 (Open, Investigating, Fixed, Verified, Closed) |
| `test_item_id` | text | FK | 発見のきっかけとなったテスト項目 |
| `assigned_to` | text | - | 担当者名 |
| `updated_at` | integer | NOT NULL | 最終更新日時 |

### 2.3 issues (課題)
カンバンボードで管理される一般的な開発タスクです。

| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | text | PK | 一意識別子 |
| `title` | text | NOT NULL | タスク名 |
| `description` | text | NOT NULL | タスクの詳細 |
| `status` | text | Default: 'Todo' | 状態 (Todo, InProgress, Done, Blocked) |
| `priority` | text | NOT NULL | 優先度 (Low, Medium, High) |
| `assigned_to` | text | - | 担当者名 |
| `updated_at` | integer | NOT NULL | 最終更新日時 |

---

## 3. リレーションシップ (Relationship)

### TestItem と Defect の連携
- `test_items.defect_id` または `defects.test_item_id` を介して相互に参照可能です。
- **ルール**: テスト結果が `Fail` になった際、新しい `Defect` レコードを作成し、その ID を `test_items` に記録することで、品質のトレーサビリティを確保します。

### Issue との関連性（今後の拡張性）
- 現在は独立した管理となっていますが、将来的には `Issue` ID を各テーブルに持たせることで、「どの開発タスクに対してどのテストが行われたか」を完全に紐付けることが可能です。
