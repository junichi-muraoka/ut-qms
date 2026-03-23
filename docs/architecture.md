# アーキテクチャ設計 (Architecture Design)

## 1. システム全体構成
Qraft は Cloudflare プラットフォームに最適化されたエッジネイティブ・アプリケーションです。

```mermaid
graph TB
    User((ユーザー))
    
    subgraph Cloudflare_Edge
        Pages[Cloudflare Pages<br/>React / Vite]
        Workers[Cloudflare Workers<br/>Hono API]
        D1[(Cloudflare D1<br/>SQLite)]
    end
    
    User --- Pages
    Pages --- Workers
    Workers --- D1
```

## 2. データモデル (ER図)
Drizzle ORM で定義されているコア・エンティティのリレーションシップです。

```mermaid
erDiagram
    test_items ||--o| defects : "reports"
    test_items {
        text id PK
        text title
        text status "NoRun, Pass, Fail, Blocked"
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

## 3. 技術スタックの選定理由
- **Frontend (React 19 + Vite)**: 最新の React 機能を活用し、高速な HMR とビルドを実現。
- **Backend (Hono)**: Cloudflare Workers での動作に特化した、極めてオーバーヘッドの少ない API フレームワーク。
- **ORM (Drizzle)**: 型安全なクエリと、D1 (SQLite) とのシームレスな統合。
- **Styling (Vanilla CSS)**: 柔軟性とパフォーマンスを両立。
