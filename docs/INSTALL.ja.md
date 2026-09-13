# Obsidian へのインストールと更新

このページでは、Obsidian のプラグインを初めて手動で入れる人向けに説明します。

難しい操作はありません。基本は **ZIP をダウンロード → 展開 → 3ファイルを Vault の決まった場所へ入れる** だけです。

## いちばん簡単なインストール方法

### 1. ZIP をダウンロードする

1. [最新の GitHub Release](https://github.com/YuzuMikan404/note-share-image-exporter-fork/releases/latest) を開きます。
2. ページ下部の **Assets** を開きます。
3. `readable-note-exporter-<version>.zip` をダウンロードします。

`<version>` の部分には `1.1.1` のような数字が入ります。通常は、数字が一番新しいものを使えば大丈夫です。

### 2. ZIP を展開する

ダウンロードした ZIP を展開します。

中に次の3ファイルがあることを確認してください。

```text
main.js
manifest.json
styles.css
```

この3ファイルがプラグイン本体です。

### 3. 自分の Vault を開く

**Vault** は、Obsidian のノートが保存されているフォルダのことです。

たとえば普段のノートが次の場所にあるなら、`MyVault` が Vault です。

```text
MyVault/
├─ 日記.md
├─ メモ.md
└─ .obsidian/
```

どこが Vault かわからない場合は、Obsidian で現在使っている Vault の場所を確認してから、Windows のエクスプローラー、macOS の Finder、またはスマホのファイル管理アプリでそのフォルダを開いてください。

### 4. `.obsidian/plugins` を開く

Vault の中にある `.obsidian` フォルダを開き、その中の `plugins` フォルダを開きます。

```text
<Vault>/.obsidian/plugins/
```

`.obsidian` が見つからない場合は、隠しファイル・隠しフォルダの表示を有効にしてください。

`plugins` フォルダがまだない場合は、自分で作成して問題ありません。

### 5. プラグイン用フォルダを作る

`plugins` の中に、次の名前で新しいフォルダを作ります。

```text
readable-note-exporter
```

最終的な場所は次のようになります。

```text
<Vault>/.obsidian/plugins/readable-note-exporter/
```

### 6. 3ファイルを入れる

ZIP から展開した3ファイルを、`readable-note-exporter` フォルダの直下へ入れます。

正しい状態は次のとおりです。

```text
<Vault>/
└─ .obsidian/
   └─ plugins/
      └─ readable-note-exporter/
         ├─ main.js
         ├─ manifest.json
         └─ styles.css
```

特に多い間違いは、フォルダが二重になることです。

```text
× readable-note-exporter/readable-note-exporter/main.js
○ readable-note-exporter/main.js
```

### 7. Obsidian で有効にする

1. Obsidian を再起動します。
2. **設定** を開きます。
3. **コミュニティプラグイン** を開きます。
4. **Readable Note Exporter** を探します。
5. スイッチをオンにします。

一覧に **Readable Note Exporter** が表示されれば、インストールはできています。

## 動作確認

Markdown ノートを開き、次のいずれかを試します。

- ファイル一覧でノートを右クリック -> **Export to image**
- エディタ内を右クリック -> **Export to image**
- コマンドパレット -> **Export as an image**

プレビューが開けばインストール成功です。**保存**を押すと、保存先未指定の場合は元ノートと同じフォルダへ画像/PDF が作成されます。

初めて使う場合は、まず設定を変えずにそのまま **保存** を押してみるのがおすすめです。標準でスマホ閲覧向けのプリセットが用意されています。

## プラグインが表示されないとき

次の順番で確認してください。

1. `readable-note-exporter` フォルダの直下に `manifest.json` があるか確認します。
2. フォルダ名が `readable-note-exporter` になっているか確認します。
3. ZIP の中のフォルダをそのまま重ねてしまい、二重フォルダになっていないか確認します。
4. Obsidian を完全に終了して、もう一度起動します。
5. **設定 -> コミュニティプラグイン** をもう一度開きます。

正しい場所は次です。

```text
<Vault>/.obsidian/plugins/readable-note-exporter/manifest.json
```

ここに `manifest.json` があれば、配置は正しいです。

## 更新

新しいバージョンへ更新するときも、初回とほぼ同じです。

1. [最新の GitHub Release](https://github.com/YuzuMikan404/note-share-image-exporter-fork/releases/latest) から新しい ZIP をダウンロードします。
2. ZIP を展開します。
3. 次のフォルダ内にある `main.js`、`manifest.json`、`styles.css` を、新しい3ファイルで置き換えます。

   ```text
   <Vault>/.obsidian/plugins/readable-note-exporter/
   ```

3. Obsidian を再起動するか、プラグインを再読み込みします。
4. **設定 -> コミュニティプラグイン** でプラグインが有効なことを確認します。

プラグイン設定や保存したプリセットは通常、これら3ファイルとは別の `data.json` に保存されるため、更新時に3ファイルを差し替えても維持されます。

## スマホで使う場合

スマホでも、Vault 内の `.obsidian/plugins/readable-note-exporter/` に同じ3ファイルを置けば使えます。

ただし、スマホのファイル管理アプリでは `.obsidian` のような「`.` から始まるフォルダ」が見えにくいことがあります。その場合は、隠しファイルを表示できるファイル管理アプリを使うか、PC 側でインストールしてから普段使っている Vault の同期方法でスマホ側へ反映するのが簡単です。

## アンインストール

Obsidian でプラグインを無効にしてから、次のフォルダを削除します。

```text
<Vault>/.obsidian/plugins/readable-note-exporter/
```

このフォルダを削除すれば、プラグイン本体も削除されます。

## 保存場所の考え方

プレビューの **保存先フォルダ（Vault相対）** が空欄なら、元ノートと同じフォルダへ保存します。`Exports/Images` のように指定した場合は Vault ルートからの相対パスとして扱います。

複数画像になる場合は保存先直下にノート名のフォルダを作り、各ページをその直下へ保存します。

```text
Exports/Images/MyNote/MyNote_1.png
Exports/Images/MyNote/MyNote_2.png
```

既存ファイルは上書きせず、必要に応じて `_1` などの連番を付けます。
