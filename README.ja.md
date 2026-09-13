# Readable Note Exporter

[English](README.md) | 日本語 | [中文](README.zh-CN.md)

Obsidian のノート・選択範囲・フォルダを、スマホでも読みやすい画像や PDF として書き出すプラグインです。プレビュー、分割、プリセット、保存先指定、透かし、作者情報に対応しています。

<img src="docs/readme/Note_Image_Exporter_Demo.png" width="650" alt="Obsidian ノートの画像エクスポート例">

## まず使うには

Obsidian のプラグインを手動で入れたことがない場合は、**ZIP を1つダウンロードする方法**がおすすめです。

1. [最新の Release](https://github.com/YuzuMikan404/note-share-image-exporter-fork/releases/latest) を開きます。
2. **Assets** の中から `readable-note-exporter-<version>.zip` をダウンロードします。
3. ZIP を展開します。中に `main.js`、`manifest.json`、`styles.css` が入っています。
4. 自分の Vault の中に、次のフォルダを作ります。

   ```text
   <Vault>/.obsidian/plugins/readable-note-exporter/
   ```

5. 展開した3ファイルを、そのフォルダの直下へ入れます。
6. Obsidian を再起動します。
7. **設定 -> コミュニティプラグイン** を開き、**Readable Note Exporter** をオンにします。

これでインストール完了です。ノートを右クリックして **Export to image** が表示されれば使えます。

「Vault がどのフォルダかわからない」「`.obsidian` が見つからない」「プラグインが一覧に出ない」という場合は、[初心者向けの詳しいインストール手順](docs/INSTALL.ja.md) を見てください。

## 基本的な使い方

Markdown ノートを右クリックして **Export to image** を選ぶか、コマンドパレットから **Export as an image** を実行します。エディタで文字を選択して右クリックすると、選択範囲だけを画像化できます。

プレビューで幅・余白・解像度・形式・分割方法・保存先などを調整し、**保存**を押します。保存結果はデスクトップでもスマホでも Vault 内に作成されます。

## 保存先

**保存先フォルダ（Vault相対）** を空欄にすると、元ノートと同じフォルダ直下へ保存します。

たとえば元ノートが次の場合:

```text
Notes/MyNote.md
```

1枚だけなら次のように保存されます。

```text
Notes/MyNote.png
```

複数枚に分割された場合は、ノート名のフォルダを作り、その直下へ保存します。

```text
Notes/MyNote/MyNote_1.png
Notes/MyNote/MyNote_2.png
Notes/MyNote/MyNote_3.png
```

保存先に `Exports/Images` を指定した場合は Vault ルートからの相対パスとして扱われます。既存ファイルを上書きせず、同名がある場合は `_1` などの連番を付けます。

## 分割方法

プレビューの分割設定では次を選べます。

- **分割なし**: ノート全体を1枚として出力します。
- **固定高さ**: 指定した高さを目安に分割します。文字行の途中を避けて切れる位置を選びます。
- **水平線**: Markdown の水平線で分割します。
- **自動**: 段落やブロックの区切りを見ながら、指定高さを目安にページ分けします。
- **段落ごとに1枚**: 表示上のトップレベル段落・ブロックごとに1枚ずつ出力します。
- **指定した区切りで分割**: `---` など、指定文字列と一致する区切りブロックごとに分割します。区切りブロック自体は画像に含めません。

画像が複数枚になる場合は上記のノート名フォルダへ保存されます。PDF は複数ページの1つの PDF として保存されます。

## プリセット

プレビュー上部のプリセット欄から、現在の設定を名前付きで保存できます。プリセットには次の項目が保存されます。

- 画像幅
- 解像度
- 画像形式
- 余白
- 分割設定

標準では **Mobile long (1080 x 2000)** を用意しています。幅 1080 px、分割高さ 2000 px、3x、PNG、余白 32 px で、9:16 より少し縦長のスマホ閲覧向け設定です。

## スマホでの利用

スマホではプレビューを画面いっぱいに近い形で開き、設定欄とプレビューを操作しやすくしています。保存先は Vault 内なので、スマホでも Obsidian のファイルとしてそのまま扱えます。

## 更新方法

新しい Release が出たら、同じプラグインフォルダ内の次の3ファイルを新しいものへ置き換えます。

```text
main.js
manifest.json
styles.css
```

置き換え後に Obsidian を再起動するか、プラグインを再読み込みしてください。保存済みの設定やプリセットはこれらとは別に保存されるため、通常はそのまま引き継がれます。

## フォルダ一括エクスポート

ファイル一覧でフォルダを右クリックして **Export all notes to image** を選ぶと、そのフォルダ内の Markdown ノートをまとめて書き出せます。

## CLI からのエクスポート

デスクトップ版では Obsidian 公式 CLI の `eval` から `exportFileToPath()` を呼び出せます。これはプレビューを開かず、絶対パスへ直接出力する開発・自動化向け機能です。

```bash
obsidian vault="My Vault" eval code="(async()=>await app.plugins.plugins['readable-note-exporter'].exportFileToPath({\
  input:'Folder/Note.md',\
  output:'/Users/me/Downloads/note.png',\
  options:{format:'png0',resolutionMode:'3x',width:900,split:{mode:'none'}}\
}))()"
```

通常のプレビューからの保存は Vault 内へ行われますが、`exportFileToPath()` はデスクトップの絶対パスへ書き込む別経路です。

## 開発とリリース

```bash
npm ci
npm run lint
npm run build
```

GitHub Actions では push / pull request ごとに lint と production build を実行します。`v1.1.0` のような `v*` タグを push すると、Release 用ビルドを行い、次のファイルを GitHub Release に添付します。

```text
main.js
manifest.json
styles.css
readable-note-exporter-<version>.zip
```

## クレジット

オリジナル作者: [chuyuan-li](https://github.com/chuyuan-li)

フォーク: [YuzuMikan404/note-share-image-exporter-fork](https://github.com/YuzuMikan404/note-share-image-exporter-fork)

## ライセンス

MIT
