# セットアップガイド

## 1. Node.js のインストール

```bash
# Homebrewのインストール（まだの場合）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Homebrewのパスを設定（M1/M2 Macの場合）
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# Node.jsのインストール
brew install node

# 確認
node --version
npm --version
```

## 2. 依存パッケージのインストール

```bash
cd ~/creative-ad-platform
npm install
```

## 3. Supabase プロジェクトの作成

1. https://supabase.com にアクセスしてアカウント作成
2. 「New project」でプロジェクト作成
3. SQL Editorに `supabase/schema.sql` の内容をコピペして実行
4. Settings > API から以下をコピー：
   - Project URL
   - anon public key

## 4. Google OAuth の設定

1. https://console.cloud.google.com でプロジェクト作成
2. APIとサービス > 認証情報 > OAuthクライアントID作成
3. 承認済みリダイレクトURIに追加：
   - `https://[your-project].supabase.co/auth/v1/callback`
4. Supabase > Authentication > Providers > Googleで設定

## 5. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
OPENAI_API_KEY=sk-...  # 任意
```

## 6. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセス

## 7. Vercel へのデプロイ

```bash
npm install -g vercel
vercel
```

環境変数をVercelにも設定すること。
