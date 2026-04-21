# アーキテクチャ設計 (Architecture Design)

## 1. システム全体構成
Qraft は Cloudflare プラットフォームに最適化されたエッジネイティブ・アプリケーションです。

![Infrastructure Concept](../01_specifications/images/qraft_infrastructure_concept.png)

```mermaid
graph TB
    User((ユーザー))
    Google[Google Auth Server]
    
    subgraph Cloudflare_Edge
        Pages[Cloudflare Pages<br/>React / Vite]
        Workers[Cloudflare Workers<br/>Hono API]
        D1[(Cloudflare D1<br/>SQLite)]
    end
    
    User <-->|HTTPS / JWT| Pages
    Pages <-->|API Calls| Workers
    Workers <-->|Query| D1
    User <-->|OAuth Interaction| Google
    Workers <-->|Verify Token| Google
```

## 2. 認証・セッション管理 (Authentication Flow)
認証プロバイダ (Google) とバックエンド (Hono/Workers) 間の詳細なやり取りです。

```mermaid
sequenceDiagram
    participant U as ユーザー (Browser)
    participant B as バックエンド (Hono / Workers)
    participant G as Google OAuth Server
    
    U->>B: 1. ログインリクエスト (/api/auth/google)
    B-->>U: 2. Google 認証画面へリダイレクト
    U->>G: 3. 認証情報の入力 & 承認
    G-->>U: 4. Callback URL へリダイレクト (+ auth_code)
    U->>B: 5. 認証コード送信 (/api/auth/google/callback)
    B->>G: 6. 認証コード & シークレット検証
    G-->>B: 7. ユーザープロフィール取得
    B->>B: 8. JWT セッション作成 & 署名
    B-->>U: 9. セッションクッキー (Secure/HttpOnly) 付与
    U->>B: 10. 保護されたAPIリクエスト (JWT Cookie 同封)
    B->>B: 11. 署名検証 & セッション認可
    B-->>U: 12. データ返却
```

- **ミドルウェア**: Hono バックエンドにカスタム認証ミドルウェアを配備し、すべての保護されたリクエストをエッジで検証。

## 3. データモデル (ER図)
Drizzle ORM で定義されているコア・エンティティのリレーションシップです。

```mermaid
erDiagram
    users ||--o{ test_items : "assigned_to"
    test_items ||--o| defects : "reports"
    
    users {
        text id PK
        text email
        text name
        text picture
        integer created_at
    }
    
    test_items {
        text id PK
        text title
        text status "NoRun, Pass, Fail, Blocked"
        text assigned_to FK
        integer updated_at
    }
    
    defects {
        text id PK
        text title
        text status "Open, Investigating, Fixed, Verified, Closed"
        text test_item_id FK
    }
    
    issues {
        text id PK
        text title
        text status "Todo, InProgress, Done, Blocked"
    }
```

## 4. 技術スタックの選定理由
- **Frontend (React 19 + Vite)**: 最新の React 機能を活用し、高速な HMR とビルドを実現。
- **Backend (Hono)**: Cloudflare Workers での動作に特化した、極めてオーバーヘッドの少ない TypeScript 特化型フレームワーク。
- **ORM (Drizzle)**: 型安全なクエリと、D1 (SQLite) とのシームレスな統合。
- **Security (Jose)**: エッジ環境で高速に JWT の署名・検証を行うための軽量ライブラリ。