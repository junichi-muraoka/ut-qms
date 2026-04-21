## 🎯 目的 / 実装詳細 (To-Be)
WBS と連動したリアルタイム・タイムラインを実現。
- **Gantt Chart**: Recharts または専用ライブラリ。`start_date`, `end_date` の描画。
- **Progress Sync**: `useEffect` による子タスク完了データの親タスク進捗への即時反映。

## ✅ 完了条件 (Acceptance Criteria)
- [ ] parent_id に属する複数の子タスクの進捗（完了率）が、親タスクの進捗バーに正確にロールアップされる。
- [ ] **[証明必須]**：ガントチャートの時間軸が、DB の `due_date` と正確に一致すること。

## 🧪 自動検証計画 (Automated Verification)
### 1. 単体テスト (Vitest)
- **ファイル**: `client/tests/utils/progress.test.ts`
- **検証**: 小数点以下の進捗計算ロジック。
### 2. E2E テスト (Playwright)
- **ファイル**: `client/e2e/gantt_visual.spec.ts`
- **検証**: `expect(page.locator('.gantt-item')).toHaveAttribute('data-duration', '3d')` など。

---
> [!CAUTION]
> **エビデンス添付ルールの徹底**
> 本タスクの完了（Close）には、上記自動テストがパスしたことを示す **Playwright の実行レポート画面のスクリーンショットのコメント添付** が必須です。
