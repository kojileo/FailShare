# Node.js 20の公式イメージを使用
FROM node:20-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 全ての依存関係をインストール（ビルド用）
# レガシーピア依存関係フラグを使用してバージョン競合を回避
RUN npm ci --legacy-peer-deps

# Build引数を定義
ARG EXPO_PUBLIC_ENVIRONMENT=production
ARG EXPO_PUBLIC_FIREBASE_API_KEY
ARG EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG EXPO_PUBLIC_FIREBASE_PROJECT_ID
ARG EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG EXPO_PUBLIC_FIREBASE_APP_ID

# 環境変数を設定
ENV NODE_ENV=production
ENV EXPO_PUBLIC_ENVIRONMENT=$EXPO_PUBLIC_ENVIRONMENT
ENV EXPO_PUBLIC_FIREBASE_API_KEY=$EXPO_PUBLIC_FIREBASE_API_KEY
ENV EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=$EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV EXPO_PUBLIC_FIREBASE_PROJECT_ID=$EXPO_PUBLIC_FIREBASE_PROJECT_ID
ENV EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=$EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV EXPO_PUBLIC_FIREBASE_APP_ID=$EXPO_PUBLIC_FIREBASE_APP_ID

# アプリケーションのソースコードをコピー
COPY . .

# Webビルドを実行（環境変数が設定済み）
RUN npm run build:web:prod

# SEO対策のためのHTMLファイルを修正
RUN sed -i 's|<title>FailShare (Dev)</title>|<title>FailShare - 失敗を成長の糧に変える学び合いコミュニティ</title>|g' dist/index.html && \
    sed -i 's|<html lang="en">|<html lang="ja">|g' dist/index.html && \
    sed -i '/<meta name="description"/d' dist/index.html && \
    sed -i '/<link rel="icon"/d' dist/index.html && \
    sed -i 's|</style>|</style>\n  <meta name="description" content="失敗談を共有し、みんなで学び合うコミュニティ。失敗を恥ずかしい秘密ではなく、価値ある学習リソースとして捉え直し、支え合うことで成長を促進します。">\n  <meta name="keywords" content="失敗談,失敗体験,学習,成長,コミュニティ,振り返り,経験談,アドバイス">\n  <meta name="author" content="FailShare">\n  \n  <!-- Open Graph / Facebook -->\n  <meta property="og:type" content="website">\n  <meta property="og:url" content="https://fail-share.com/">\n  <meta property="og:title" content="FailShare - 失敗を成長の糧に変える学び合いコミュニティ">\n  <meta property="og:description" content="失敗談を共有し、みんなで学び合うコミュニティ。失敗を恥ずかしい秘密ではなく、価値ある学習リソースとして捉え直し、支え合うことで成長を促進します。">\n  <meta property="og:image" content="https://fail-share.com/og-image.jpg">\n\n  <!-- Twitter -->\n  <meta property="twitter:card" content="summary_large_image">\n  <meta property="twitter:url" content="https://fail-share.com/">\n  <meta property="twitter:title" content="FailShare - 失敗を成長の糧に変える学び合いコミュニティ">\n  <meta property="twitter:description" content="失敗談を共有し、みんなで学び合うコミュニティ。失敗を恥ずかしい秘密ではなく、価値ある学習リソースとして捉え直し、支え合うことで成長を促進します。">\n  <meta property="twitter:image" content="https://fail-share.com/og-image.jpg">\n\n  <!-- Canonical URL -->\n  <link rel="canonical" href="https://fail-share.com/">\n  \n  <link rel="icon" href="/favicon.ico" />|g' dist/index.html

# 本番用依存関係のみ再インストール
RUN npm ci --only=production && npm cache clean --force

# ポート8080を公開
EXPOSE 8080

# サーバーを起動
CMD ["npm", "run", "server:start"] 