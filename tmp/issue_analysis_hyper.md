## 🎯 目的 / 実装詳細 (To-Be)
未然防止と再発防止のライフサイクルを統合。
- **Review Hub**: 指摘区分（`logic`, `design`, `typo` 等）別のパレート図。
- **Bug Analysis**: 根本原因（Root Cause）のカプセル化。

## ✅ 完了条件 (Acceptance Criteria)
- [ ] レビュー指摘から `test_item` または `defect` への変換リンクが動作すること。
- [ ] **[証明必須]**：分析画面に表示される「原因区分パレート図」のデータが、DB の集計と一致すること。

## 🧪 自動検証計画 (Automated Verification)
### 1. 単体テスト (Vitest)
- **ファイル**: `server/tests/analysis_logic.test.ts`
- **検証**: 発生原因別のランキング・集計精度。
### 2. E2E テスト (Playwright)
- **ファイル**: `client/e2e/analysis_dashboard.spec.ts`
- **検証**: `data-testid="paretto-chart"` のレンダリング検証。

---
> [!CAUTION]
> **エビデンス添付ルールの徹底**
> 本タスクの完了（Close）には、開発中に入力した **具体的な分析チャート画面のスクリーンショットのコメント添付** が必須です。
