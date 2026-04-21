## 🎯 目的 / 実装詳細 (To-Be)
新生 Qraft の全機能を支えるための Drizzle ORM スキーマを再構築。

### 🛠 具体的変更点
- **`milestones`**: `id` (UUID), `name` (text), `due_date` (integer), `criteria` (text 判定基準) を新設。
- **`test_items` / `issues`**: `parent_id` (自己参照), `estimated_hours` (integer), `actual_hours` (integer), `module_name` (text 密度計算用) を追加。
- **`defects`**: `defect_type` (機能欠落, 表示崩れ等), `cause_category` (設計ミス, 実装漏れ等), `root_cause` (テキスト分析用) を追加。
- **`attachments`**: `id`, `target_id` (test_item or defect), `url` (証跡URL), `type` (image, log) を新設。

## ✅ 完了条件 (Acceptance Criteria)
- [ ] `npx drizzle-kit generate` でエラーなく SQL マイグレーションファイルが生成されること。
- [ ] **[証明必須]**：`SELECT parent_id FROM test_items WHERE id = 'xxx'` で期待する階層構造が返ること。
- [ ] **[証明必須]**：`estimated_hours` に数値以外を保存しようとした際に API が `400 Bad Request` を返すこと。

## 🧪 自動検証計画 (Automated Verification)
### 1. 単体テスト (Vitest)
- **ファイル**: `server/tests/db.test.ts`
- **検証**: `await db.insert(milestones)...` を実行し、`updated_at` が自動付与され、全カラムが期待値と完全一致することをアサート。
### 2. E2E テスト (Playwright)
- **ファイル**: `client/e2e/schema_init.spec.ts`
- **検証**: 新設された「モジュール選択」プルダウンが UI 上に `data-testid="module-select"` で存在し、選択肢が DB の内容を反映していることを自動検証。

---
> [!CAUTION]
> **エビデンス添付ルールの徹底**
> 本タスクの完了（Close）には、上記自動テストがパスしたことを示す **コンソールログのコピー、または Playwright のレポート画面のスクリーンショットのコメント添付** が必須です。
