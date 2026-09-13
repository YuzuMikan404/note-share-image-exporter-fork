import { type App, type FrontMatterCache, Notice, Platform } from 'obsidian';
import React, {
  useState, useRef, type FC, useEffect, useCallback,
} from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { isCopiable } from 'src/imageFormatTester';
import { copy, save, saveAll } from '../../utils/capture';
import { hasValidExportWidth, syncUnifiedPadding } from '../../utils/settings';
import L from '../../L';
import Target, { type TargetRef } from '../common/Target';
import FormItems from '../common/form/FormItems';
import { formatAvailable, getAvailableFormats } from 'src/settings';

function featureText() {
  const ja = activeDocument.documentElement.lang.toLowerCase().startsWith('ja');
  return ja ? {
    exportFolder: '保存先フォルダ（Vault相対）',
    exportFolderDesc: '空欄なら元ノートと同じフォルダに保存します。複数枚はノート名のサブフォルダに保存します。',
    paragraph: '段落ごとに1枚',
    delimiter: '指定した区切りで分割',
    delimiterLabel: 'エクスポート区切り',
    delimiterDesc: '例: ---。区切り行そのものは出力から除外されます。',
    preset: 'プリセット',
    presetName: 'プリセット名',
    apply: '適用',
    savePreset: '現在の設定を保存',
    deletePreset: '削除',
  } : {
    exportFolder: 'Export folder (vault-relative)',
    exportFolderDesc: 'Leave blank to save beside the source note. Multi-image exports go into a note-named subfolder.',
    paragraph: 'One image per paragraph',
    delimiter: 'Split by custom delimiter',
    delimiterLabel: 'Export delimiter',
    delimiterDesc: 'Example: ---. The delimiter block itself is omitted from exported images.',
    preset: 'Preset',
    presetName: 'Preset name',
    apply: 'Apply',
    savePreset: 'Save current settings',
    deletePreset: 'Delete',
  };
}

const getFormSchema = (settings: ISettings, availableFormats: FileFormat[]): FormSchema<ISettings> => {
  const text = featureText();
  return [
  {
    label: L.includingFilename(),
    path: 'showFilename',
    type: 'boolean',
  },
  {
    label: L.imageWidth(),
    path: 'width',
    type: 'number',
  },
  {
    label: text.exportFolder,
    desc: text.exportFolderDesc,
    path: 'exportFolder',
    type: 'string',
  },
  {
    label: L.setting.padding.unified(),
    path: 'padding.unified',
    type: 'boolean',
  },
  {
    path: 'padding.top',
    label: settings.padding?.unified !== false ? L.setting.padding.all() : L.setting.padding.top(),
    desc: settings.padding?.unified !== false ? undefined : L.setting.padding.description(),
    type: 'number',
    when: { flag: true, path: 'padding.unified' },
  },
  {
    path: 'padding.top',
    label: L.setting.padding.top(),
    desc: L.setting.padding.description(),
    type: 'number',
    when: (s) => s.padding?.unified === false,
  },
  {
    path: 'padding.right',
    label: L.setting.padding.right(),
    type: 'number',
    when: (s) => s.padding?.unified === false,
  },
  {
    path: 'padding.bottom',
    label: L.setting.padding.bottom(),
    type: 'number',
    when: (s) => s.padding?.unified === false,
  },
  {
    path: 'padding.left',
    label: L.setting.padding.left(),
    type: 'number',
    when: (s) => s.padding?.unified === false,
  },
  {
    path: 'resolutionMode',
    label: L.setting.resolutionMode.label(),
    desc: L.setting.resolutionMode.description(),
    type: 'select',
    options: [
      { text: "1x", value: '1x' },
      { text: "2x", value: '2x' },
      { text: "3x", value: '3x' },
      { text: "4x", value: '4x' },
    ],
  },
  {
    label: L.setting.userInfo.show(),
    path: 'authorInfo.show',
    type: 'boolean',
  },
  {
    label: L.setting.userInfo.name(),
    path: 'authorInfo.name',
    type: 'string',
    when: { flag: true, path: 'authorInfo.show' },
  },
  {
    label: L.setting.userInfo.remark(),
    path: 'authorInfo.remark',
    type: 'string',
    when: { flag: true, path: 'authorInfo.show' },
  },
  {
    label: L.setting.userInfo.avatar.title(),
    path: 'authorInfo.avatar',
    type: 'string',
    when: { flag: true, path: 'authorInfo.show' },
  },
  {
    label: L.setting.userInfo.align(),
    path: 'authorInfo.align',
    type: 'select',
    options: [
      { text: L.setting.userInfo.alignOptions.left(), value: 'left' },
      { text: L.setting.userInfo.alignOptions.center(), value: 'center' },
      { text: L.setting.userInfo.alignOptions.right(), value: 'right' },
    ],
    when: { flag: true, path: 'authorInfo.show' },
  },
  {
    label: L.setting.watermark.enable.label(),
    path: 'watermark.enable',
    type: 'boolean',
  },
  {
    label: L.setting.watermark.type.label(),
    path: 'watermark.type',
    type: 'select',
    options: [
      { text: L.setting.watermark.type.text(), value: 'text' },
      { text: L.setting.watermark.type.image(), value: 'image' },
    ],
    when: { flag: true, path: 'watermark.enable' },
  },
  {
    label: L.setting.watermark.text.content(),
    path: 'watermark.text.content',
    type: 'string',
    when: (s) => s.watermark.enable && s.watermark.type === 'text',
  },
  {
    label: L.setting.watermark.text.fontSize(),
    path: 'watermark.text.fontSize',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'text',
  },
  {
    label: L.setting.watermark.text.fontFamily(),
    path: 'watermark.text.fontFamily',
    type: 'string',
    when: (s) => s.watermark.enable && s.watermark.type === 'text',
  },
  {
    label: L.setting.watermark.text.color(),
    path: 'watermark.text.color',
    type: 'string',
    when: (s) => s.watermark.enable && s.watermark.type === 'text',
  },
  {
    label: L.setting.watermark.opacity(),
    path: 'watermark.opacity',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'text',
  },
  {
    label: L.setting.watermark.rotate(),
    path: 'watermark.rotate',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'text',
  },
  {
    label: L.setting.watermark.x(),
    path: 'watermark.x',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'text',
  },
  {
    label: L.setting.watermark.y(),
    path: 'watermark.y',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'text',
  },
  {
    label: L.setting.watermark.image.src.label(),
    path: 'watermark.image.src',
    type: 'string',
    when: (s) => s.watermark.enable && s.watermark.type === 'image',
  },
  {
    label: L.setting.watermark.width(),
    path: 'watermark.width',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'image',
  },
  {
    label: L.setting.watermark.height(),
    path: 'watermark.height',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'image',
  },
  {
    label: L.setting.watermark.opacity(),
    path: 'watermark.opacity',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'image',
  },
  {
    label: L.setting.watermark.rotate(),
    path: 'watermark.rotate',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'image',
  },
  {
    label: L.setting.watermark.x(),
    path: 'watermark.x',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'image',
  },
  {
    label: L.setting.watermark.y(),
    path: 'watermark.y',
    type: 'number',
    when: (s) => s.watermark.enable && s.watermark.type === 'image',
  },
  {
    label: L.setting.assetMark.enable.label(),
    desc: L.setting.assetMark.enable.description(),
    path: 'assetMark.enable',
    type: 'boolean',
  },
  {
    label: L.setting.assetMark.ownerId.label(),
    desc: L.setting.assetMark.ownerId.description(),
    path: 'assetMark.ownerId',
    type: 'string',
    when: { flag: true, path: 'assetMark.enable' },
  },
  {
    path: 'split.mode',
    label: L.setting.split.mode.label(),
    desc: L.setting.split.mode.description(),
    type: 'select',
    options: [
      { text: L.setting.split.mode.none(), value: 'none' },
      { text: L.setting.split.mode.fixed(), value: 'fixed' },
      { text: L.setting.split.mode.hr(), value: 'hr' },
      { text: L.setting.split.mode.auto(), value: 'auto' },
      { text: text.paragraph, value: 'paragraph' },
      { text: text.delimiter, value: 'delimiter' },
    ],
  },
  {
    path: 'split.height',
    desc: L.setting.split.height.description(),
    label: L.setting.split.height.label(),
    type: 'number',
    when: (settings) => settings.split.mode === 'fixed' || settings.split.mode === 'auto',
  },
  {
    path: 'split.overlap',
    desc: L.setting.split.overlap.description(),
    label: L.setting.split.overlap.label(),
    type: 'number',
    when: (settings) => settings.split.mode === 'fixed',
  },
  {
    path: 'split.delimiter',
    desc: text.delimiterDesc,
    label: text.delimiterLabel,
    type: 'string',
    when: (settings) => settings.split.mode === 'delimiter',
  },
  {
    label: L.setting.metadata.label(),
    path: 'showMetadata',
    type: 'boolean',
  },
  {
    label: L.setting.format.title(),
    path: 'format',
    type: 'select',
    options: ([
      { text: L.setting.format.png0(), value: 'png0' },
      { text: L.setting.format.png1(), value: 'png1' },
      { text: L.setting.format.jpg(), value: 'jpg' },
      { text: '.webp', value: 'webp' },
      { text: L.setting.format.pdf(), value: 'pdf' },
    ] satisfies Array<{ text: string; value: FileFormat }>).filter(({ value }) => availableFormats.includes(value)),
  },
  ];
};

interface Props {
  settings: ISettings;
  app: App;
  markdownEl: HTMLElement;
  frontmatter: FrontMatterCache | undefined;
  metadataMap: Record<string, { type: MetadataType }>;
  title: string;
  sourcePath: string;
  modalContainerEl: HTMLElement;
  onPersistSettings?: (settings: ISettings) => Promise<void>;
}

const ModalContent: FC<Props> = ({
  markdownEl, settings, frontmatter, metadataMap, title, sourcePath, app, modalContainerEl, onPersistSettings,
}) => {
  const [formData, setFormData] = useState<ISettings>(() => structuredClone(settings));
  const [availableFormats, setAvailableFormats] = useState<FileFormat[]>(formatAvailable);
  const [presetName, setPresetName] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState(settings.presets[0]?.id ?? '');

  useEffect(() => {
    let cancelled = false;
    void getAvailableFormats().then((formats) => {
      if (!cancelled) {
        setAvailableFormats([...formats]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpdate = useCallback((newData: ISettings) => {
    setFormData(syncUnifiedPadding(formData, newData));
  }, [formData]);

  const applyPreset = useCallback(() => {
    const preset = formData.presets.find(item => item.id === selectedPresetId);
    if (!preset) return;
    setFormData(current => ({
      ...current,
      width: preset.width,
      resolutionMode: preset.resolutionMode,
      format: preset.format,
      padding: structuredClone(preset.padding),
      split: structuredClone(preset.split),
    }));
  }, [formData.presets, selectedPresetId]);

  const savePreset = useCallback(async () => {
    const name = presetName.trim();
    if (!name) return;
    const preset: ExportPreset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      width: formData.width ?? 1080,
      resolutionMode: formData.resolutionMode,
      format: formData.format,
      padding: structuredClone(formData.padding),
      split: structuredClone(formData.split),
    };
    const presets = [...formData.presets, preset];
    setFormData(current => ({ ...current, presets }));
    setSelectedPresetId(preset.id);
    setPresetName('');
    if (onPersistSettings) {
      await onPersistSettings({ ...settings, presets });
    }
  }, [formData, onPersistSettings, presetName, settings]);

  const deletePreset = useCallback(async () => {
    if (!selectedPresetId) return;
    const presets = formData.presets.filter(item => item.id !== selectedPresetId);
    setFormData(current => ({ ...current, presets }));
    setSelectedPresetId(presets[0]?.id ?? '');
    if (onPersistSettings) {
      await onPersistSettings({ ...settings, presets });
    }
  }, [formData.presets, onPersistSettings, selectedPresetId, settings]);

  const root = useRef<TargetRef>(null);
  const [mainHeight, setMainHeight] = useState(0);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const previewOutRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateHeight = () => {
      const height = modalContainerEl.clientHeight;
      if (height) {
        setMainHeight(Platform.isMobile
          ? Math.max(260, Math.min(420, Math.floor(height * 0.42)))
          : height - 160);
      }
    };

    // 初始计算
    calculateHeight();

    // 监听窗口大小变化
    activeWindow.addEventListener('resize', calculateHeight);

    return () => {
      activeWindow.removeEventListener('resize', calculateHeight);
    };
  }, [modalContainerEl]);

  useEffect(() => {
    let timeoutId: number | undefined;
    const markContentLoaded = () => {
      timeoutId = window.setTimeout(() => {
        setIsLoading(false);
      }, 100);
    };

    // 当 markdownEl 准备好时，更新 loading 状态
    if (markdownEl.instanceOf(HTMLElement) && markdownEl.innerHTML.length > 0) {
      markContentLoaded();
    }

    // 监听内容加载完成事件
    const handleContentLoaded = () => {
      markContentLoaded();
    };

    activeDocument.addEventListener("export-image-content-loaded", handleContentLoaded);

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      activeDocument.removeEventListener("export-image-content-loaded", handleContentLoaded);
    };
  }, [markdownEl]);

  const [processing, setProcessing] = useState(false);
  const [allowCopy, setAllowCopy] = useState(false);
  const [rootHeight, setRootHeight] = useState(0);
  const [pages, setPages] = useState(1);
  const [scale, setScale] = useState(1);

  const calculateScale = useCallback(() => {
    if (!root.current?.element || !previewOutRef.current) return 1;
    const contentHeight = root.current.element.clientHeight;
    const contentWidth = root.current.element.clientWidth;
    const previewWidth = previewOutRef.current.clientWidth;

    return Math.min(
      1,
      mainHeight / (contentHeight || 100),
      previewWidth / ((contentWidth || 0) + 2),
    ) / 2;
  }, [mainHeight]);

  useEffect(() => {
    if (!root.current?.element || processing) {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (root.current?.element) {
        if (!processing) {
          setRootHeight(root.current.element.clientHeight);
        }
      }
    });
    observer.observe(root.current.element);
    return () => {
      observer.disconnect();
    };
  }, [root.current?.element, processing]);

  const handleSplitChange = useCallback((positions: number[]) => {
    setPages(positions.length + 1);
  }, []);

  useEffect(() => {
    if (formData.split.mode === 'none') {
      setPages(1);
    }
  }, [formData.split.mode]);

  useEffect(() => {
    setAllowCopy(false);
    void isCopiable(formData.format)
      .then(result => {
        setAllowCopy(Boolean(result));
      })
      .catch(() => {
        setAllowCopy(false);
      });
  }, [formData.format]);

  const handleSave = useCallback(async () => {
    if (!hasValidExportWidth(formData)) {
      new Notice(L.invalidWidth());
      return;
    }
    if (!root.current) return;

    setProcessing(true);
    try {
      await save(
        app,
        root.current.contentElement,
        title,
        formData.resolutionMode,
        formData.format,
        formData.assetMark,
        sourcePath,
        formData.exportFolder,
      );
    } catch {
      new Notice(L.saveFail());
    } finally {
      setProcessing(false);
    }
  }, [root, formData.resolutionMode, formData.format, formData.assetMark, formData.exportFolder, sourcePath, title, formData.width]);
  const handleCopy = useCallback(async () => {
    if (!hasValidExportWidth(formData)) {
      new Notice(L.invalidWidth());
      return;
    }
    if (!root.current) return;

    setProcessing(true);
    try {
      await copy(root.current.contentElement, formData.resolutionMode, formData.format, formData.assetMark);
    } catch {
      new Notice(L.copyFail());
    } finally {
      setProcessing(false);
    }
  }, [root, formData.resolutionMode, formData.format, title, formData.width]);

  const handleSaveAll = useCallback(async () => {
    if (!hasValidExportWidth(formData)) {
      new Notice(L.invalidWidth());
      return;
    }
    if (!root.current) return;

    setProcessing(true);
    try {
      await saveAll(
        root.current,
        formData.format,
        formData.resolutionMode,
        formData.split.height,
        formData.split.overlap,
        formData.split.mode,
        app,
        title,
        formData.assetMark,
        sourcePath,
        formData.exportFolder,
        formData.split.delimiter,
      );
    } catch {
      new Notice(L.saveFail());
    } finally {
      setProcessing(false);
    }
  }, [root, formData.format, formData.resolutionMode, formData.split, formData.assetMark, formData.exportFolder, app, sourcePath, title]);

  return (
    <div className='export-image-preview-root'>
      <div className='export-image-preview-main'>
        <div className='export-image-preview-left'>
          <div
            className='export-image-preview-out'
            ref={previewOutRef}
            style={{
              height: mainHeight,
              cursor: isGrabbing ? 'grabbing' : 'grab',
            }}
          >
            {isLoading ? (
              <div className="export-image-loading">
                <div className="export-image-loading-spinner"></div>
                <div className="export-image-loading-text">{L.loading()}</div>
              </div>
            ) : (
              <TransformWrapper
                minScale={calculateScale()}
                maxScale={4}
                pinch={{ step: 20 }}
                doubleClick={{ mode: 'reset' }}
                centerZoomedOut={false}
                onPanning={() => {
                  setIsGrabbing(true);
                }}
                onPanningStop={() => {
                  setIsGrabbing(false);
                }}
                onTransformed={(e) => {
                  setScale(e.state.scale);
                }}
                initialScale={1}
              >
                <TransformComponent
                  wrapperStyle={{
                    width: '100%',
                    height: mainHeight,
                  }}
                  contentStyle={{
                    border: '1px var(--divider-color) solid',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 0 10px 10px rgba(0,0,0,0.15)',
                  }}
                >
                  <Target
                    ref={root}
                    frontmatter={frontmatter}
                    markdownEl={markdownEl}
                    setting={formData}
                    metadataMap={metadataMap}
                    app={app}
                    title={title}
                    scale={scale}
                    isProcessing={processing}
                    onSplitChange={handleSplitChange}
                  ></Target>
                </TransformComponent>
              </TransformWrapper>
            )}
          </div>
          <div className='info-text'>{L.guide()}</div>
        </div>
        <div className='export-image-preview-right'>
          <div className='export-image-preset-panel'>
            <div className='export-image-preset-row'>
              <label>{featureText().preset}</label>
              <select
                value={selectedPresetId}
                onChange={(event) => setSelectedPresetId(event.currentTarget.value)}
              >
                {formData.presets.map(preset => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
              </select>
              <button type='button' onClick={applyPreset} disabled={!selectedPresetId}>
                {featureText().apply}
              </button>
              <button type='button' onClick={() => void deletePreset()} disabled={!selectedPresetId}>
                {featureText().deletePreset}
              </button>
            </div>
            <div className='export-image-preset-row'>
              <input
                value={presetName}
                placeholder={featureText().presetName}
                onChange={(event) => setPresetName(event.currentTarget.value)}
              />
              <button type='button' onClick={() => void savePreset()} disabled={!presetName.trim()}>
                {featureText().savePreset}
              </button>
            </div>
          </div>
          <FormItems
            formSchema={getFormSchema(formData, availableFormats)}
            update={handleUpdate}
            settings={formData}
            app={app}
          />
          {(formData.split.mode === 'fixed' || formData.split.mode === 'auto') && <div className='info-text'>
            {L.splitInfo({ rootHeight, splitHeight: formData.split.height, pages })}
          </div>}
          {(formData.split.mode === 'hr' || formData.split.mode === 'paragraph' || formData.split.mode === 'delimiter') && <div className='info-text'>
            {L.splitInfoHr({ rootHeight, pages })}
          </div>}
          <div className='info-text'>{L.moreSetting()}</div>
        </div>
      </div>
      <div className='export-image-preview-actions'>
        {pages === 1 && (
          <div>
            <button
              onClick={() => {
                void handleCopy();
              }}
              disabled={processing || !allowCopy || isLoading}
            >
              {L.copy()}
            </button>
            {allowCopy || <p>{L.notAllowCopy({ format: formData.format.replace(/\d$/, '').toUpperCase() })}</p>}
          </div>
        )}

        <button
          onClick={() => {
            void (pages === 1 ? handleSave() : handleSaveAll());
          }}
          disabled={processing || isLoading}
        >
          {Platform.isMobile ? L.saveVault() : L.save()}
        </button>
      </div>
    </div>
  );
};

export default ModalContent;
