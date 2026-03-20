# デプロイ初期設定ガイド (Setup Deployment)

このドキュメントでは、GitHub Actions を使って本アプリを Cloudflare に自動デプロイするための初期設定手順を解説します。

## 1. Cloudflare アカウント ID の確認
まずは、デプロイ先を特定するための「アカウント ID」を準備します。

![Account ID の確認場所](../docs/images/cloudflare_account_id_guide.webp)

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com/)にログインします。
2. ブラウザの URL（アドレスバー）を確認してください。
3. `dash.cloudflare.com/` の直後にある **32文字の英数字** があなたのアカウント ID です。
    * 例: `dash.cloudflare.com/24c7770d36a6...` の場合、`24c7770d36a6...` が ID です。

## 2. API トークン（合鍵）の発行
GitHub があなたの代わりにデプロイを行うための「合鍵」を発行します。

![API トークンの作成テンプレート](../docs/images/cloudflare_api_token_guide.webp)

1. 右上の人型アイコンをクリックし、**「My Profile」** を選びます。
2. 左メニューの **「API Tokens」** をクリックします。
3. **「Create Token」** ボタンを押します。
4. **「Edit Cloudflare Workers」** テンプレートの右側にある **「Use template」** をクリックします。
5. そのままページ最下部の **「Continue to summary」** → **「Create Token」** と進みます。
6. 表示された英数字をコピーして安全な場所にメモしてください（**一度しか表示されません**）。

## 3. GitHub Secrets への登録
取得した ID とトークンを GitHub に登録します。これにより、パスワードを公開することなく安全に自動デプロイができるようになります。

![GitHub Secrets の登録画面](../docs/images/github_secrets_guide.webp)

1. GitHub リポジトリ（`ut-qms`）の **「Settings」** タブを開きます。
2. 左メニューの **「Secrets and variables」** > **「Actions」** をクリックします。
3. **「New repository secret」** ボタンを押し、以下の 2 つを登録します。

| 名前 (Name) | 値 (Secret) |
| :--- | :--- |
| `CLOUDFLARE_API_TOKEN` | 手順 2 で取得した API トークン |
| `CLOUDFLARE_ACCOUNT_ID` | 手順 1 で取得したアカウント ID |

## 4. 完了！
設定が終わると、次回以降 `main` ブランチにプッシュするたびに、自動で最新版が公開されるようになります。
進捗は GitHub の **「Actions」** タブから確認できます。
