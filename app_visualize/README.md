# 建設業界アプリケーション可視化ツール

このアプリケーションは、建設業界のアプリケーションデータをダイアル形式で可視化するためのツールです。CSVファイルからデータをインポートし、インタラクティブな可視化を提供します。

## 機能

- CSVファイルのインポートと処理
- ダイアル形式での可視化（内側から外側へ：分野、フェーズ、カテゴリ）
- インタラクティブな要素：
  - セグメントにホバーすると強調表示
  - 関連するアプリケーションのランキングをポップアップ表示
  - マウスを離すと元の表示に戻る

## 使用方法

1. `index.html` をウェブブラウザで開きます
2. 「ファイルを選択」ボタンをクリックしてCSVファイルをアップロード
3. 「可視化」ボタンをクリックしてデータを可視化
4. ダイアルの各セグメントにマウスを合わせると、関連するアプリケーションのランキングが表示されます

## CSVファイル形式

アプリケーションは以下の形式のCSVファイルを想定しています：

- 各行は1つのアプリケーションを表す
- 以下のフィールドを含む：
  - アプリケーション名
  - 会社名
  - URL
  - 説明
  - 分野（Field）
  - フェーズ（Phase）
  - カテゴリ（Category）
  - 売上高
  - その他の属性

## 技術スタック

- HTML5
- CSS3
- JavaScript (ES6+)
- D3.js（可視化ライブラリ）

## ファイル構成

- `index.html` - メインのHTMLファイル
- `styles.css` - スタイルシート
- `data-processor.js` - CSVデータの解析と変換を行うクラス
- `visualization.js` - D3.jsを使用した可視化を行うクラス
- `main.js` - ファイルアップロードと初期化を処理するメインスクリプト
- `source.csv` - サンプルデータ（含まれている場合） 