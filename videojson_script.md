## 📄 YouTube動画収集スクリプト仕様書（Node.js版）

### 📌 概要

このスクリプトは、YouTube Data API v3 を用いて、指定チャンネル（ジャルジャル公式）から動画情報を取得し、Webアプリ `JalJalGotcha` に使用する `videos.json` を自動生成する。

---

### 🧩 構成ファイル

- `.env`: APIキーおよびチャンネルIDの設定
- `fetch_videos.js`: メインスクリプト
- 出力先: `public/videos.json`

---

### 🔐 環境変数（`.env`）

```env
YOUTUBE_API_KEY=AIzaSyAkgeRhULkhr2Bi48C-32r8GVPKEcIau44
YOUTUBE_CHANNEL_ID=UChwgNUWPM-ksOP3BbfQHS5Q
```

---

### 🔧 主な処理内容

1. **動画IDの収集**
   - API: `search.list`
   - 指定チャンネルの全動画IDをページネーションで取得

2. **動画メタ情報の取得**
   - API: `videos.list`
   - 最大50件ずつバッチで動画詳細を取得
   - 対象フィールド：
     - `id`
     - `snippet.title`
     - `contentDetails.duration`（ISO 8601）

3. **データ整形**
   - duration（ISO 8601）を秒数に変換（例: `PT3M30S` → `210`）
   - サムネイルURLを構成（例: `https://img.youtube.com/vi/VIDEO_ID/0.jpg`）
   - JalJalGotcha_Spec_Template.mdに記載の形式で構造化



4. **昇順ソート**
   - `duration` 昇順に並び替え

5. **保存**
   - 出力ファイル: `public/videos.json`
   - JSON形式、UTF-8、インデント付き

---

### 📦 使用ライブラリ

- `axios`: HTTP通信
- `dotenv`: 環境変数読み込み
- `fs`: ファイル書き出し
- `iso8601-duration`: ISO 8601 を秒に変換

---

### ✅ 実行方法

```bash
node fetch_videos.js
```
