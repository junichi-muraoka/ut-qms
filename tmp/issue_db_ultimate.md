## 🎯 目的 / 背景
新生 Qraft の全機能を支えるための Drizzle ORM スキーマを拡張。WBS（階層構造）、工数管理、原因分析、多人数証跡管理の基盤を物理的に構築する。

---

## 🛠 実装設計 (Implementation Design)

以下のテーブル定義を `server/db/schema.ts` に実装する：

### 1. 新規テーブル：`milestones` (フェーズ管理)
- **columns**: `id` (text/PK), `name` (text/Not Null), `due_date` (integer/Not Null), `criteria` (text 達成基準)
- **logic**: プロジェクトの大きな区切りとなるマイルストーンを定義。

### 2. 既存テーブル拡張：`test_items` (WBS & 工数)
- **columns追加**: 
  - `parent_id` (text): `test_items.id` への内部参照。
  - `estimated_hours` (integer): 予定工数。
  - `actual_hours` (integer): 実績工数。
  - `module_name` (text): 密度計算用の機能分類。

### 3. 既存テーブル拡張：`defects` (分析基盤)
- **columns追加**:
  - `defect_type` (text): `enum`値 (Bug, Refinement, Task)。
  - `cause_category` (text): `enum`値 (Logic, UI/UX, Requirement, Environment)。
  - `root_cause` (text): 根本原因のテキスト分析用。

### 4. 新規テーブル：`attachments` (証跡ハブ)
- **columns**: `id` (text/PK), `target_id` (text/FK to test_item/defect), `url` (text), `type` (text: image/log/link)
- **logic**: 1つのタスクや不具合に対し、複数の画像やログを紐付け可能にする。

---

## 📊 検証項目 & 合否判定 (Unit / E2E / Progress)

| No. | 種別 | 検証項目 | 判定基準（「正しい」の定義） | 提出エビデンス | 🔍 完了 |
| :--- | :--- | :--- | :--- | :--- | :--: |
| **01** | **Unit** | **WBS 自己参照構造** | `(A).children[0].id === (B).id` であること。 | ①Vitest実行ログ<br>②DBダンプ(JSON) | `[ ]` |
| **02** | **Unit** | **FK 制約の有効性** | 存在しない親 ID 指定時に `SQLITE_CONSTRAINT_FOREIGNKEY` で失敗すること。 | エラーログの<br>スクリーンショット | `[ ]` |
| **03** | **Unit** | **型バリデーション** | 工数カラムに非数値を送信しバリデーションエラー (`400`) になること。 | APIレスポンスの<br>スクリーンショット | `[ ]` |
| **04** | **E2E** | **スキーマ反映確認** | Playwright を用いて、UI 上に新設された「予定工数」入力欄が表示されること。 | Playwright<br>実行用レポート | `[ ]` |

---

## ✅ 最終完了条件 (Definition of Done)
- [ ] schema.ts の実装が上記設計と 100% 一致していること。
- [ ] 全ての検証項目 (No.01 〜 04) で「🔍 完了」チェックが埋まっていること。
- [ ] 各チェックに対応するエビデンスが、Issue コメントに漏れなく添付されていること。
