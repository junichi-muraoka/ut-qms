# CI/CD セットアップガイド (GitHub Actions & Cloudflare)

Qraft の自動デプロイパイプラインを有効にするための手順書です。

## 1. ワークフロー概要

GitHub へのプッシュを検知して、以下の環境へ自動デプロイされます。

| ブランチ | 環境 | デプロイ先 (Pages/Workers) |
| :--- | :--- | :--- |
| `main` | **Production** | `qraft` |
| `develop` | **Staging** | `qraft-staging` |

---

## 2. 必要な GitHub Secrets の設定

GitHub リポジトリの **Settings > Secrets and variables > Actions > Repository secrets** に以下の 2 つを設定してください。

1.  **`CLOUDFLARE_API_TOKEN`**:
    *   [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) で作成します。
    *   テンプレート「Cloudflare Workers の編集 (Edit Cloudflare Workers)」を使用し、対象のリポジトリに関連する Account/Zone を選択してください。
2.  **`CLOUDFLARE_ACCOUNT_ID`**:
    *   Cloudflare のダッシュボードの URL または Workers ページの右側に表示されている「Account ID」をコピーします。

---

## 3. ステージング環境の使用方法

1.  新しい機能を開発する際は、`develop` ブランチから機能ブランチを作成し、完了後に `develop` へプルリクエストを作成・マージします。
2.  `develop` にマージされると、[qraft-staging.pages.dev](https://qraft-staging.pages.dev) （仮）に自動反映されます。
3.  検証が完了したら、`develop` から `main` へプルリクエストを作成し、本番環境へリリースします。

---

## 4. トラブルシューティング

*   **Deployment failed (Authentication error)**: GitHub Secrets が正しく設定されているか、トークンの権限が不足していないかを確認してください。
*   **Database not found**: `wrangler.toml` の `database_id` が Cloudflare 上の実際の ID と一致しているか確認してください（※現在は 2026/03/28 時点での最新 ID に更新済みです）。
