# Readable Note Exporter

English | [日本語](README.ja.md) | [中文](README.zh-CN.md)

Export Obsidian notes, selections, and folders as readable images or PDFs with live preview, flexible splitting, reusable presets, watermarks, and author info.

<img src="docs/readme/Note_Image_Exporter_Demo.png" width="650" alt="An exported Obsidian note with Mermaid, math, code, watermark, and author info">

Readable Note Exporter keeps Obsidian rendering in the result, including Mermaid diagrams, math, code blocks, callouts, metadata, and your current note styling.

## Quick start

1. Install the plugin from the latest GitHub Release. See [Installation](#installation).
2. Enable **Readable Note Exporter** in **Settings -> Community plugins**.
3. Right-click a note, selected text, or folder and choose the image export command.
4. Adjust the preview and press **Save**. The result is saved into the vault.

<img src="docs/readme/export-preview.png" width="800" alt="Image export preview with export settings">

## Features

- Export notes as PNG, JPG, WebP, or PDF.
- Save exports inside the vault on desktop and mobile.
- Leave the export folder blank to save beside the source note, or specify a vault-relative destination.
- Put multi-image exports directly inside a subfolder named after the note.
- Split long notes by fixed height, horizontal rule, automatic pagination, paragraph, or a custom delimiter such as `---`.
- Avoid cutting through text lines when fixed-height pagination chooses a page break.
- Save and reuse export presets.
- Start with a mobile-oriented **1080 x 2000** preset, slightly taller than 9:16.
- Use a mobile-friendly full-screen preview layout.
- Copy an image directly from the preview when the selected format and platform support clipboard copy.
- Add text/image watermarks, an invisible asset mark, and author information.
- Export every Markdown note in a folder.

## Splitting modes

The export preview provides these split modes:

- **None**: export one image/PDF page from the complete note.
- **Fixed height**: target a page height while preferring safe line boundaries so text is not cut in the middle.
- **Horizontal rule**: split at rendered horizontal rules.
- **Automatic**: group rendered blocks into pages around the selected target height.
- **One image per paragraph**: export each rendered top-level paragraph/block as a separate image.
- **Custom delimiter**: split at a block whose text exactly matches the configured delimiter. `---` is the default example, and the delimiter block itself is omitted.

When an image export produces multiple files, they are saved in a note-named subfolder. PDF split mode creates one multi-page PDF.

## Presets

The preview includes a preset panel. A preset stores width, resolution, format, padding, and split settings. Enter a preset name and choose **Save current settings** to reuse those values later.

The default preset is **Mobile long (1080 x 2000)** with 1080 px width, a 2000 px automatic split target, 3x resolution, PNG output, and 32 px padding.

## Export destination

Set **Export folder (vault-relative)** in the preview or plugin settings.

- Blank: save beside the source note.
- `Exports/Images`: save below that path from the vault root.
- Multiple image pages: save below `<destination>/<note-name>/`.
- Existing names are preserved; a numeric suffix such as `_1` is added instead of overwriting an existing file.

## Usage

### Export a note

- Right-click a Markdown file in the file explorer and choose **Export to image**.
- Right-click inside the editor and choose **Export to image**.
- Open the command palette and run **Export as an image**.

### Export a selection

Select text in the editor, right-click it, and choose **Export selection to image**. Quick selection export can also be enabled in plugin settings.

### Export a folder

Right-click a folder and choose **Export all notes to image** to export Markdown notes from that folder.

## Installation

This fork can be installed manually from GitHub Releases.

1. Open the [latest release](https://github.com/YuzuMikan404/note-share-image-exporter-fork/releases/latest).
2. Download `main.js`, `manifest.json`, and `styles.css`, or download the release ZIP and extract those files.
3. Create this folder inside the vault:

   ```text
   <Vault>/.obsidian/plugins/readable-note-exporter/
   ```

4. Put `main.js`, `manifest.json`, and `styles.css` directly in that folder.
5. Restart Obsidian, or reload the app/plugins.
6. Open **Settings -> Community plugins** and enable **Readable Note Exporter**.

For Japanese step-by-step installation and update instructions, see [docs/INSTALL.ja.md](docs/INSTALL.ja.md).

### Updating

Download the files from the newer GitHub Release and replace these three files in the same plugin folder:

```text
main.js
manifest.json
styles.css
```

Then restart Obsidian or reload the plugin. Your saved plugin settings are stored separately and are not replaced by these files.

## Obsidian CLI export

The plugin exposes `exportFileToPath()` for Obsidian's official desktop `eval` command. It uses Obsidian's Markdown renderer, theme, and plugin runtime while skipping the preview modal.

```bash
obsidian vault="My Vault" eval code="(async()=>await app.plugins.plugins['readable-note-exporter'].exportFileToPath({\
  input:'Folder/Note.md',\
  output:'/Users/me/Downloads/note.png',\
  options:{\
    format:'png0',\
    resolutionMode:'3x',\
    width:900,\
    split:{mode:'none'}\
  }\
}))()"
```

`input` can be a vault-relative Markdown path or an absolute path inside the vault. `output` is an absolute desktop file path. Split image CLI exports use `.zip`; split PDF exports use `.pdf`.

## Platform notes

- Preview **Save** writes into the current vault on desktop and mobile.
- Clipboard copy support depends on output format and platform.
- `exportFileToPath()` is desktop-only because it writes to an absolute local file path outside the normal vault-saving flow.

## Privacy and network use

Notes are rendered and exported locally. The plugin does not send note content to a service.

Network requests are only used for remote image URLs that you provide for export assets, such as an image watermark or avatar. Use local vault images or uploaded images when you do not want a remote image fetched during export.

## Development

```bash
npm ci
npm run dev
npm run lint
npm run build
```

GitHub Actions runs lint and production builds on pushes and pull requests. Tags matching `v*` build the plugin and publish a GitHub Release containing `main.js`, `manifest.json`, `styles.css`, and a ZIP package.

To publish a release, first update the package/manifest version, commit the changes, then push a matching tag, for example:

```bash
git tag v1.1.1
git push origin v1.1.1
```

## Credits

Originally created by [chuyuan-li](https://github.com/chuyuan-li). This fork is maintained at [YuzuMikan404/note-share-image-exporter-fork](https://github.com/YuzuMikan404/note-share-image-exporter-fork).

## License

MIT
