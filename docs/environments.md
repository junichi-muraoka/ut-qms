# 実行環境（詳細）

Qraft が稼働する Cloudflare 上のインフラ構成および各環境の詳細情報です。

## 1. 環境一覧

| 区分 | ターゲット名 | 本番/検証 | ブランチ | アクセスURL |
| :--- | :--- | :--- | :--- | :--- |
| **Production** | qraft | 本番用 | `main` | [🔗 https://qraft.pages.dev](https://qraft.pages.dev) |
| **Staging** | qraft-staging | 検証用 | `develop` | [🔗 https://qraft-staging.pages.dev](https://qraft-staging.pages.dev) |

> [!NOTE]
> `*.pages.dev` は Cloudflare 純正のサービスドメインです。

## 2. インフラ詳細設定

### バックエンド (Cloudflare Workers / D1)

| 項目 | Production | Staging/Dev |
| :--- | :--- | :--- |
| **サービス名** | `qraft` | `qraft-staging` |
| **D1 Database名** | `ut-qms-db` | `ut-qms-db-staging` |
| **D1 Database ID** | `6878b30e-5494-47df-bc8d-f5f4f6690757` | `4bd0f2a9-7c8a-44e2-9657-3f3d35a8f49a` |

### フロントエンド (Cloudflare Pages)

| 項目 | Production | Staging/Dev |
| :--- | :--- | :--- |
| **プロジェクト名** | `qraft` | `qraft-staging` |
| **ビルドコマンド** | `npm run build` | `npm run build` |
| **出力ディレクトリ** | `dist` | `dist` |

## 3. GitHub Secrets (認証情報)

GitHub Actions を通じてこれらを安全にデプロイするため、リポジトリに以下の Secrets が登録されている必要があります。

- `CLOUDFLARE_API_TOKEN`: Cloudflare Workers の編集権限を持つトークン。
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare のアカウント固有 ID。

## 4. ローカル開発環境の構成

開発時は、以下のコマンドでバックエンドとフロントエンドを並行して起動できます。

```bash
# Backend (Port 3000)
npm run server

# Frontend (Port 5173)
npm run client
```

---
詳細は [インフラ概要（採用の背景）](./cloudflare_overview.md) を参照してください。
