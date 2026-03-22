# 🌐 実行環境（詳細）

このドキュメントでは、Qraft プロジェクトが利用している各実行環境の詳細について記載します。

## 1. 環境一覧

| 環境名 | ブランチ | フロントエンド (Pages) | バックエンド (Workers) | D1 データベース |
| :--- | :--- | :--- | :--- | :--- |
| **Production** | `main` | `qraft` | `qraft` | `qraft-db` |
| **Staging** | `develop` | `qraft-staging` | `qraft-staging` | `qraft-db-staging` |

## 2. インフラ定義の詳細

### バックエンド (Cloudflare Workers / D1)
バックエンドの環境定義は `server/wrangler.toml` に集約されています。

- **Production (Default)**
    - サービス名: `qraft`
    - D1 Database ID: `9844bf0a-8208-449e-ae32-514064d65542`
- **Staging (`staging`)**
    - サービス名: `qraft-staging`
    - D1 Database ID: `88abf121-b0bc-4ea2-9b45-db4cd162fd67`

### フロントエンド (Cloudflare Pages)
フロントエンドのデプロイ先は `.github/workflows/deploy.yml` で定義されています。

- **Production**:
    - プロジェクト名: `qraft`
    - アクセスURL: `https://qraft.pages.dev` (Cloudflare デフォルト)
- **Staging**:
    - プロジェクト名: `qraft-staging`
    - アクセスURL: `https://qraft-staging.pages.dev` (Cloudflare デフォルト)

## 3. 設定ファイルとシークレット

### GitHub Secrets
自動デプロイを機能させるために、GitHub リポジトリの `Settings > Secrets > Actions` に以下を登録する必要があります。
詳細は [デプロイ初期設定ガイド](./setup_deployment.md) を参照してください。

- `CLOUDFLARE_API_TOKEN`: Cloudflare API トークン
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare アカウント ID

### 環境変数
各環境固有の変数が必要な場合は、`server/wrangler.toml` の `[vars]` 項目、または GitHub Secrets を経由して設定します。

## 4. ローカル開発環境

開発マシン上ではエミュレータまたはローカルDBを使用して動作します。

- **バックエンド**: `npm run server`
    - デフォルトでは `http://localhost:3000` で待機します。
- **フロントエンド**: `npm run client`
    - Vite デブサーバーが `http://localhost:5173` 等で起動します。
