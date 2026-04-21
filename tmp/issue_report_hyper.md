## 🎯 目的 / 実装詳細 (To-Be)
定量データ（パス率、収束曲線）と定性コメントを統合。
- **Weekly Report**: `GET /api/reports/weekly?week=xx`
- **Quality Report**: `GET /api/reports/quality` から Markdown 出力。

## ✅ 完了条件 (Acceptance Criteria)
- [ ] ボタンクリック後、最新の `test_items.status` を集計したグラフが描画される。
- [ ] **[証明必須]**：出力された Markdown の「バグ密度」の値が、DB のレコード数と一致すること。

## 🧪 自動検証計画 (Automated Verification)
### 1. 単体テスト (Vitest)
- **ファイル**: `server/tests/aggregates.test.ts`
- **検証**: 加重平均や累積収束率の計算精度。
### 2. E2E テスト (Playwright)
- **ファイル**: `client/e2e/report_ui.spec.ts`
- **検証**: `expect(page.locator('.quality-chart')).toBeVisible()` および CSV 出力整合性の検証。

---
> [!CAUTION]
> **エビデンス添付ルールの徹底**
> 本タスクの完了（Close）には、実際に生成された **Markdown/PDF レポートサンプルの Issue コメントへの直接添付** が必須です。
