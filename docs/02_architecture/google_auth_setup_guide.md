# Google OAuth 2.0 設定ガイド（クレジットカード不要版）

このドキュメントでは、Cloudflare Access を使わずに Google ログイン機能を Qraft に導入するための、Google Cloud Console での設定手順を記録します。

## 1. プロジェクトの作成
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス。
2. 上部メニューから「新しいプロジェクト」を作成。
   - プロジェクト名: `qraft-auth` など

## 2. OAuth 同意画面の設定
1. 左メニュー「API とサービス」 > 「OAuth 同意画面」を選択。
2. **User Type**: **「外部 (External)」** を選択して作成。
3. **アプリ情報**: 
   - アプリ名: `Qraft`
   - ユーザーサポートメール: 自分のメールアドレス
   - デベロッパーの連絡先: 自分のメールアドレス
4. 「保存して次へ」を最後まで押し、「ダッシュボードに戻る」で完了。

## 3. 認証情報（クライアントID）の発行
1. 左メニュー「認証情報」を選択。
2. 上部「認証情報を作成」 > **「OAuth クライアント ID」** を選択。
3. **アプリケーションの種類**: 「ウェブ アプリケーション」を選択。
4. **名前**: `Qraft Web Client` など
5. **承認済みのリダイレクト URI**: 以下の 3つをすべて追加。
   - `http://localhost:3001/api/auth/google/callback` (ローカル開発用)
   - `https://qraft-staging.j-muraoka-secure.workers.dev/api/auth/google/callback` (ステージング用)
   - `https://qraft.j-muraoka-secure.workers.dev/api/auth/google/callback` (本番用)
6. 「作成」を押し、表示された **クライアント ID** と **クライアント シークレット** を控える。

## 4. アプリへの設定
取得した ID とシークレットを、以下の環境変数に設定します。
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET` (セッション署名用の適当な長い文字列)

---
> [!TIP]
> **なぜ「外部」を選ぶのか？**
> 「内部」は Google Workspace（企業用）を契約している組織内だけでしか使えませんが、「外部」なら個人の Google アカウントで誰でも（または許可したテストユーザーのみ）ログインできるためです。
