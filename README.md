# 早慶理工 入学者偏差値推定

慶應義塾大学理工学部・早稲田大学理工3学部の入学者偏差値を、公式入試統計と河合塾全統模試データから推定するダッシュボード。

## 機能

- **構成分析**: 入学者を東大落ち・京大落ち・東工大落ち・第一志望等に分解し、各グループの人数と平均偏差値を推定
- **学科別比較**: 慶應5学門＋早稲田8学科を統一テーブルで比較（ソート対応）
- **個別カード**: 各学門/学科ごとの合格者・入学者分布をヒストグラム表示
- **検証タブ**: 駿台ベネッセ併願成功率データとの整合性検証

## データソース

- 慶應義塾大学 2025年度入試統計
- 早稲田大学 2025年度入試統計
- 河合塾 全統模試 偏差値帯別合格者分布
- 河合塾 2026年度入試難易予想（ボーダー偏差値）
- 駿台ベネッセ 2023年度併願成功率

## ローカル開発

```bash
npm install
npm run dev
```

http://localhost:5173 で開きます。

## デプロイ

### Vercel（最も簡単）

1. GitHubにpush
2. [vercel.com](https://vercel.com) でImport
3. Framework: Vite を選択 → Deploy

### GitHub Pages

1. `vite.config.js` の `base` をリポジトリ名に変更:
   ```js
   base: '/waseda-keio-compare/',
   ```
2. GitHubリポジトリの Settings → Pages → Source: **GitHub Actions**
3. pushすると `.github/workflows/deploy.yml` が自動実行

### Cloudflare Pages

1. [dash.cloudflare.com](https://dash.cloudflare.com) → Pages → Connect to Git
2. Build command: `npm run build`
3. Output directory: `dist`
