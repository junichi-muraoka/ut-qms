# Cloudflare 構成概要 (Infrastructure Overview)

Qraft は、Cloudflare の提供するサーバーレスプラットフォームをフル活用することで、ゼロ・インフラ管理と高いスケーラビリティを両立しています。

## 1. コンポーネント構成

```mermaid
graph LR
    User[ユーザーブラウザ] --> Pages[Cloudflare Pages<br/>Frontend Hosting]
    Pages --> Workers[Cloudflare Workers<br/>Edge Runtime API]
    Workers --> D1[(Cloudflare D1<br/>Serverless DB)]
    Workers --> KV[Cloudflare KV<br/>Configuration/Cache]
```

## 2. 各サービスの詳細

### Cloudflare Pages
- **役割**: 静的アセット（HTML, JS, CSS）のホスティング。
- **機能**: Web Analytics による利用状況の可視化、プレビューデプロイ機能。

### Cloudflare Workers (Hono)
- **役割**: バックエンド API ロジックの実行。
- **利点**: 世界中に配置されたエッジで動作するため、レイテンシが極めて低い（Cold start がほぼゼロ）。

### Cloudflare D1
- **役割**: リレーショナルデータベース (SQLite)。
- **特徴**: 型安全な Drizzle ORM と組み合わせることで、堅牢なデータ永続化を実現。

---

### 🔑 認証基盤 (Cloudflare Zero Trust)
Qraft は、安全なシングルサインオン (SSO) を実現するために Cloudflare Zero Trust を採用しています。詳細なメリットや設定については、以下のドキュメントを参照してください。

- [**Cloudflare Zero Trust / SSO 導入ガイド**](./cloudflare_zero_trust.md)

## 3. インフラ・ダイヤグラム

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant P as Cloudflare Pages
    participant W as Cloudflare Workers
    participant D as Cloudflare D1
    
    U->>P: ページアクセス
    P-->>U: React アプリケーション返却
    U->>W: API リクエスト (/api/stats)
    W->>D: クエリ実行 (SQL)
    D-->>W: 結果返却
    W-->>U: JSON レスポンス
```

> [!NOTE]
> プロジェクトのデプロイ設定は `.wrangler/` および `wrangler.toml` で管理されています。
