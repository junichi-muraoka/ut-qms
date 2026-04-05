## 🎯 目的 / 背景
定量データ（パス率、不具合収束）の計量と定性評価を自動統合。報告の「儀式」を廃止し、意思決定の速度を最大化する。

---

## 🛠 実装設計 (Implementation Design)

### 1. レポート生成 API (`/server/api/reports`)
- **Action**: `Drizzle` で `test_items` と `defects` を JOIN 集計。
- **Calculation**: 密度計算 (Bug / KLoc or Bug / Function Point)。
- **Output**: JSON、および Markdown テンプレートレンダリング。

### 2. 収束曲線描画ロジック
- **Data**: 週次の累計不具合発見数 vs 累計改修数。
- **Library**: `Recharts` (AreaChart/LineChart)。

---

## 📊 検証項目 & 合否判定 (Unit / E2E / Progress)

| No. | 種別 | 検証項目 | 判定基準（「正しい」の定義） | 提出エビデンス | 🔍 完了 |
| :--- | :--- | :--- | :--- | :--- | :--: |
| **01** | **Unit** | **計量計算精度** | DB 上の生データと、API が返す「密度」「進捗率」の計算結果が完全一致すること。 | Vitest実行ログ | `[ ]` |
| **02** | **Unit** | **Md 生成検証** | 生成された Markdown が、最新の定性コメントを正しく取り込んでいること。 | 生成MdのRAWデータ | `[ ]` |
| **03** | **E2E** | **グラフ描画整合性** | Playwright を用い、描画されたグラフ要素が 0 でない値（パス率等）を保持していること。 | Playwright<br>実行用レポート | `[ ]` |

---

## ✅ 最終完了条件 (Definition of Done)
- [ ] 全ての検証項目で「🔍 完了」チェックが埋まっていること。
- [ ] 各チェックに対応するエビデンスが、Issue コメントに添付されていること。
