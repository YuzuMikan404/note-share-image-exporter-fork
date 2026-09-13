# Note Share Image Exporter

[English](README.md) | [日本語](README.ja.md) | 中文

将 Obsidian 笔记、选中文本和文件夹导出为便于分享的图片或 PDF，并支持实时预览、长图拆分、水印和作者信息。

<img src="docs/readme/Note_Image_Exporter_Demo.png" width="650" alt="导出后的 Obsidian 笔记，包含 Mermaid、数学公式、代码、水印和作者信息">

Note Share Image Exporter 会尽量保留 Obsidian 的渲染结果，因此导出的图片可以包含 Mermaid 图表、数学公式、代码块、Callout、元数据和当前笔记样式。

## 快速开始

1. 右键点击笔记、选中文本或文件夹。
2. 选择 **Export to image**、**Export selection to image** 或 **Export all notes to image**。
3. 在预览中调整效果，然后复制结果或保存为文件。

<img src="docs/readme/export-preview.png" width="800" alt="图片导出预览和导出设置">

## 功能

- 将笔记导出为 PNG、JPG、WebP 或 PDF。
- 桌面端和移动端都可以直接保存到当前 vault。
- 保存路径留空时保存到源笔记同目录，也可以指定 vault 相对路径。
- 多图片导出会在目标目录下创建以笔记命名的子文件夹。
- 在格式支持时，直接从导出预览复制图片。
- 导出前实时预览宽度、内边距、格式、分辨率、水印和作者信息等效果。
- 使用固定高度、水平分割线、自动分页、每段一张图或自定义分隔符拆分长笔记。
- 固定高度分页会尽量避开文字行中间，减少文字被截断。
- 保存并重复使用导出预设；默认提供面向手机阅读的 1080 x 2000 预设。
- 为分享图片添加文本水印或图片水印。
- 在导出图片像素中嵌入隐藏资产标识**(隐水印)**，便于后续匹配。
- 在导出图片中添加作者名、附加文本、头像，并设置对齐方式和显示位置。
- 从文件菜单批量导出文件夹中的 Markdown 笔记。
- 使用插件提供的 20 种界面语言。

## 使用方式

### 导出笔记

- 在文件列表中右键点击 Markdown 文件，选择 **Export to image**。
- 在编辑器中右键，选择 **Export to image**。
- 打开命令面板，运行 **Export as an image**。

### 通过 Obsidian CLI 导出

插件为 Obsidian 官方 `eval` 命令暴露了 `exportFileToPath()`。这个方法仍然使用 Obsidian 自身的 Markdown 渲染、主题和插件运行环境，但会跳过预览弹窗，直接写入指定输出路径。

前置条件：

- 已安装 Obsidian 桌面端，并且官方 `obsidian` 命令可用。
- 目标 vault 中已经安装并启用了本插件。
- 如果是手动替换 `main.js`，调用前需要重新加载插件或重启 Obsidian。

导出 PNG：

```bash
obsidian vault="My Vault" eval code="(async()=>await app.plugins.plugins['note-share-image-exporter'].exportFileToPath({\
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

导出 PDF：

```bash
obsidian vault="My Vault" eval code="(async()=>await app.plugins.plugins['note-share-image-exporter'].exportFileToPath({\
  input:'Folder/Note.md',\
  output:'/Users/me/Downloads/note.pdf',\
  options:{\
    format:'pdf',\
    split:{mode:'none'}\
  }\
}))()"
```

拆分图片导出会写入 ZIP 文件：

```bash
obsidian vault="My Vault" eval code="(async()=>await app.plugins.plugins['note-share-image-exporter'].exportFileToPath({\
  input:'Folder/Note.md',\
  output:'/Users/me/Downloads/note.zip',\
  options:{\
    format:'png0',\
    split:{\
      mode:'fixed',\
      height:1000,\
      overlap:80\
    }\
  }\
}))()"
```

`input` 可以是 vault 内相对 Markdown 路径，也可以是 vault 内的绝对路径。`output` 必须是桌面端绝对文件路径。`options` 可以省略；未传入的字段会使用插件已保存设置。输出扩展名必须与结果类型匹配：`.png`、`.jpg`、`.webp`、`.pdf`，或拆分图片导出的 `.zip`。

可以用下面的命令确认 API 是否已加载：

```bash
obsidian vault="My Vault" eval code="typeof app.plugins.plugins['note-share-image-exporter'].exportFileToPath"
```

## 平台说明

- 在桌面端和移动端，预览窗口中的保存操作都会把结果写入当前 vault。
- 保存路径为空时写入源笔记所在目录；多图片导出写入以笔记名命名的子目录。
- 是否支持复制到剪贴板取决于输出格式和平台；无法复制时请保存文件。
- `exportFileToPath()` 仅支持桌面端，因为它需要写入本地绝对文件路径。

## 安装

### 社区插件

插件上架后，可在 Obsidian 社区插件中安装 **Note Share Image Exporter**。

### 手动安装

1. 从 [最新 release](https://github.com/YuzuMikan404/note-share-image-exporter-fork/releases/latest) 下载 `main.js`、`manifest.json` 和 `styles.css`，或下载 ZIP 后解压。
2. 将它们放入 `<Vault>/.obsidian/plugins/note-share-image-exporter/`。
3. 重启 Obsidian 或重新加载插件。
4. 在 **Settings** -> **Community plugins** 中启用 **Note Share Image Exporter**。

更新时下载新 release 中的这三个文件并覆盖旧文件，然后重新加载插件即可。

## 隐私和网络请求

笔记内容会在本地渲染并导出。插件不会将笔记内容发送到服务端。

只有当你为导出资源提供远程图片 URL 时，插件才会读取该远程图片，例如图片水印或头像。如果不希望导出时读取远程图片，请使用 vault 中的本地图片或上传的图片。

## 开发

```bash
npm install
npm run dev
npm run build
npm run typesafe-i18n
```

## 作者

由 [chuyuan-li](https://github.com/chuyuan-li) 创建。

## 许可证

MIT
