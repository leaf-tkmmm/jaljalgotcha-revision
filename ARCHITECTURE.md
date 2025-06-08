# JalJalGotcha アーキテクチャドキュメント (To Be)

## プロジェクト概要

JalJalGotcha は、指定した時間に合うジャルジャルの動画の組み合わせを提供する Web アプリケーションです。ユーザーが希望する時間（分単位）を入力すると、その時間内に収まる複数の動画の組み合わせを自動生成し、表示します。

## アーキテクチャ概要

本プロジェクトは**Next.js フルスタックアプリケーション**として構成され、以下の主要コンポーネントで構成されています：

```
┌─────────────────────────────────────────┐
│           Next.js Application           │
│  ┌─────────────────┐ ┌─────────────────┐ │
│  │   Frontend      │ │   Backend       │ │
│  │   (React)       │ │   (API Routes)  │ │
│  │                 │ │   (TypeScript)  │ │
│  └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────┘
                        │
                        │ Prisma ORM
                        ▼
┌─────────────────────────────────────────┐
│        Database + Cache                 │
│  ┌─────────────────┐ ┌─────────────────┐ │
│  │   PostgreSQL    │ │     Redis       │ │
│  │   (主データ)     │ │   (キャッシュ)   │ │
│  └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────┘
```

## 技術スタック

### フルスタックフレームワーク

- **Next.js 14+** - React フルスタックフレームワーク
- **TypeScript** - 型安全性を提供（フロントエンド・バックエンド共通）
- **React 18+** - UI ライブラリ

### スタイリング（ミニマム）

- **Tailwind CSS** - ユーティリティファースト CSS フレームワーク

### データベース・キャッシュ

- **PostgreSQL** - メインデータベース
- **Redis** - キャッシュ・セッション管理
- **Prisma** - TypeScript ORM

### 外部サービス

- **YouTube Data API v3** - YouTube 動画データ取得（オプション）

## 詳細アーキテクチャ

### Next.js アプリケーション構造

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── api/                    # API Routes (バックエンド)
│   │   └── combinations/           # 動画組み合わせAPI
│   ├── page.tsx               # メインページ
│   └── layout.tsx             # レイアウト
├── components/             # UI コンポーネント
│   ├── DurationForm.tsx        # 時間入力フォーム
│   ├── VideoList.tsx           # 動画リスト表示
│   └── VideoListItem.tsx       # 個別動画アイテム
├── lib/                    # ユーティリティ・設定
│   ├── prisma.ts               # Prisma クライアント
│   ├── redis.ts                # Redis クライアント
│   └── youtube.ts              # YouTube API クライアント
├── services/               # ビジネスロジック層
│   └── video-service.ts        # 動画組み合わせロジック
├── types/                  # TypeScript 型定義
│   └── index.ts
└── prisma/                 # データベーススキーマ
    └── schema.prisma           # Prisma スキーマ
```

**主要機能（ミニマム版）:**

- 時間入力とバリデーション（1-1000 分）
- レスポンシブデザイン
- 結果の動的表示

### レイヤードアーキテクチャ

TypeScript による統一されたレイヤードアーキテクチャ：

1. **プレゼンテーション層** (`app/api/`)
   - Next.js API Routes
   - リクエスト/レスポンス処理
   - バリデーション

2. **ビジネスロジック層** (`services/`)
   - 動画組み合わせアルゴリズム
   - ビジネスルール実装

3. **データアクセス層** (`lib/`)
   - Prisma ORM によるデータベースアクセス
   - Redis キャッシュアクセス

4. **データ層** (`prisma/`)
   - Prisma スキーマ定義
   - データベース接続管理

## API 仕様

### エンドポイント

#### GET `/api/combinations`

指定された時間に合う動画の組み合わせを取得

**クエリパラメータ:**

- `duration` (string, required): 希望する動画時間（分単位、1-1000）
- `attempts` (number, optional): 生成する組み合わせ数（デフォルト: 3）

**レスポンス:**

```json
[
  {
    "videos": [
      {
        "id": "video_id",
        "title": "動画タイトル",
        "duration": 180,
        "thumbnail_url": "https://...",
        "url": "https://..."
      }
    ],
    "total_time": 580,
    "remaining_time": 20
  }
]
```

## データフロー

### 動画組み合わせ生成フロー

```
1. ユーザー入力 (duration: 10分)
   ↓
2. React コンポーネント バリデーション
   ↓
3. Next.js API Routes (/api/combinations?duration=10&attempts=3)
   ↓
4. API Route バリデーション
   ↓
5. VideoService.getCombinations()
   ├─ Redis キャッシュ確認
   ├─ Prisma で動画データ取得
   ├─ 動画を時間順ソート
   ├─ ランダム選択アルゴリズム実行
   ├─ 3つの組み合わせ生成
   └─ Redis にキャッシュ保存
   ↓
6. JSON レスポンス返却
   ↓
7. React コンポーネント結果表示
```

### 動画選択アルゴリズム

1. **時間順ソート**: 全動画を時間の短い順にソート
2. **フィルタリング**: 残り時間以下の動画のみ抽出
3. **ランダム選択**: 条件を満たす動画からランダムに 1 つ選択
4. **反復処理**: 残り時間が 1 分未満になるまで繰り返し
5. **重複排除**: 同一動画は 1 つの組み合わせ内で重複しない

## データベース設計

### Prisma スキーマ

```prisma
model Video {
  id           String    @id
  title        String
  duration     Int       // 秒単位
  thumbnailUrl String?   @map("thumbnail_url")
  url          String?
  likes        Int       @default(0)
  views        Int       @default(0)
  publishedAt  DateTime? @map("published_at")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  @@map("videos")
}
```

### TypeScript型定義

```typescript
interface Video {
  id: string
  title: string
  duration: number  // 秒単位
  thumbnailUrl?: string
  url?: string
  likes: number
  views: number
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Redis キャッシュ構造

```typescript
// キャッシュキー構造
const cacheKey = `combinations:${duration}:${attempts}`

// キャッシュデータ
interface CachedCombination {
  videos: Video[]
  totalTime: number
  remainingTime: number
  cachedAt: number
}
```

## 開発環境構築

### 前提条件

- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### セットアップコマンド

```bash
# 依存関係インストール
npm install

# データベースセットアップ
npx prisma migrate dev
npx prisma generate

# 開発サーバー起動
npm run dev
```

## デプロイ考慮事項

### 統合デプロイ

- **Next.js アプリケーション** - Vercel/Railway/Render 等
- **PostgreSQL** - 同一プラットフォーム提供のDB
- **Redis** - 同一プラットフォーム提供のRedis

### 環境変数

```bash
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
YOUTUBE_API_KEY="..."
NEXTAUTH_SECRET="..."
```

## 今後の拡張可能性（ミニマム版から）

### Phase 2: 基本機能拡張
- 動画フィルタリング（いいね数、再生数、投稿時期）
- 結果共有機能

### Phase 3: ユーザー機能
- ユーザー認証
- マイリスト機能
- 履歴管理

### Phase 4: 高度な機能
- リアルタイム更新
- パフォーマンス最適化
- モニタリング強化

このアーキテクチャにより、TypeScript統一環境でスケーラブルで保守性の高いミニマム動画組み合わせシステムを実現しています。