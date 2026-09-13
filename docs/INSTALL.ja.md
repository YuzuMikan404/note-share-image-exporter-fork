# Obsidian へのインストールと更新

このフォークは GitHub Release から手動インストールできます。

## 新規インストール

1. [最新の GitHub Release](https://github.com/YuzuMikan404/note-share-image-exporter-fork/releases/latest) を開きます。
2. Release の Assets から `main.js`、`manifest.json`、`styles.css` をダウンロードします。ZIP を使う場合は展開してください。
3. Obsidian で対象 Vault を確認します。
4. Vault 内の `.obsidian/plugins/` を開きます。`.obsidian` は隠しフォルダなので、OS 側で隠しファイル表示が必要な場合があります。
5. 次のフォルダを作ります。

   ```text
   <Vault>/.obsidian/plugins/note-share-image-exporter/
   ```

6. フォルダ直下が次の状態になるよう、3ファイルを置きます。

   ```text
   note-share-image-exporter/
   ├─ main.js
   ├─ manifest.json
   └─ styles.css
   ```

7. Obsidian を再起動します。
8. **設定 -> コミュニティプラグイン** を開きます。
9. コミュニティプラグインが無効なら有効化し、**Note Share Image Exporter** をオンにします。

## 動作確認

Markdown ノートを開き、次のいずれかを試します。

- ファイル一覧でノートを右クリック -> **Export to image**
- エディタ内を右クリック -> **Export to image**
- コマンドパレット -> **Export as an image**

プレビューが開けばインストール成功です。**保存**を押すと、保存先未指定の場合は元ノートと同じフォルダへ画像/PDF が作成されます。

## 更新

1. 新しい Release から `main.js`、`manifest.json`、`styles.css` をダウンロードします。
2. 次のフォルダ内にある同名ファイルを置き換えます。

   ```text
   <Vault>/.obsidian/plugins/note-share-image-exporter/
   ```

3. Obsidian を再起動するか、プラグインを再読み込みします。
4. **設定 -> コミュニティプラグイン** でプラグインが有効なことを確認します。

プラグイン設定や保存したプリセットは通常、これら3ファイルとは別の `data.json` に保存されるため、更新時に3ファイルを差し替えても維持されます。

## アンインストール

Obsidian でプラグインを無効にしてから、次のフォルダを削除します。

```text
<Vault>/.obsidian/plugins/note-share-image-exporter/
```

## 保存場所の考え方

プレビューの **保存先フォルダ（Vault相対）** が空欄なら、元ノートと同じフォルダへ保存します。`Exports/Images` のように指定した場合は Vault ルートからの相対パスとして扱います。

複数画像になる場合は保存先直下にノート名のフォルダを作り、各ページをその直下へ保存します。

```text
Exports/Images/MyNote/MyNote_1.png
Exports/Images/MyNote/MyNote_2.png
```

既存ファイルは上書きせず、必要に応じて `_1` などの連番を付けます。
