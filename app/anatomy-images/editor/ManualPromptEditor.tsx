"use client";

import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { AnatomyImageItem } from "@/lib/anatomy-images";
import { anatomyImages, buildManualAnatomyPrompt, defaultManualAvoidRules } from "@/lib/anatomy-images";

type LogoPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";
type LogoSize = "small" | "medium" | "large";

type EditorForm = Omit<AnatomyImageItem, "view" | "bones" | "muscles" | "fasciaLines" | "labels" | "functionNotes" | "avoid"> & {
  view: string;
  bones: string;
  muscles: string;
  fasciaLines: string;
  labels: string;
  functionNotes: string;
  avoid: string;
};

function toForm(item: AnatomyImageItem): EditorForm {
  return {
    ...item,
    view: item.view.join("、"),
    bones: item.bones.join("、"),
    muscles: item.muscles.join("、"),
    fasciaLines: item.fasciaLines.join("、"),
    labels: item.labels.join("、"),
    functionNotes: item.functionNotes.join("\n"),
    avoid: item.avoid.join("\n"),
  };
}

function splitTags(value: string) {
  return value
    .split(/[、,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function fromForm(form: EditorForm): AnatomyImageItem {
  return {
    ...form,
    view: splitTags(form.view),
    bones: splitTags(form.bones),
    muscles: splitTags(form.muscles),
    fasciaLines: splitTags(form.fasciaLines),
    labels: splitTags(form.labels),
    functionNotes: form.functionNotes.split("\n").map((item) => item.trim()).filter(Boolean),
    avoid: form.avoid.split("\n").map((item) => item.trim()).filter(Boolean),
  };
}

const logoWidthBySize: Record<LogoSize, number> = {
  small: 56,
  medium: 84,
  large: 112,
};

const logoPositions: Array<{ value: LogoPosition; label: string }> = [
  { value: "bottom-right", label: "右下" },
  { value: "bottom-left", label: "左下" },
  { value: "top-right", label: "右上" },
  { value: "top-left", label: "左上" },
];

const logoSizes: Array<{ value: LogoSize; label: string }> = [
  { value: "small", label: "小" },
  { value: "medium", label: "中" },
  { value: "large", label: "大" },
];

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image failed to load"));
    image.src = src;
  });
}

const blankItem: AnatomyImageItem = {
  id: "custom-manual-image",
  number: "03",
  titleZh: "髂腰肌與下腹核心關係",
  titleEn: "Psoas, Iliacus & Lower Core Integration",
  chapter: "CH03",
  usage: "manual-inner-page",
  imageType: "教材版",
  ratio: "4:3",
  view: ["anterior", "side"],
  bones: ["Lumbar Spine", "Pelvis", "Lesser Trochanter"],
  muscles: ["Psoas Major", "Iliacus", "Iliopsoas"],
  fasciaLines: ["DFL"],
  labels: ["Psoas Major", "Iliacus", "Lumbar Spine", "Lesser Trochanter"],
  functionNotes: ["連接腰椎與髖", "影響骨盆前側張力", "與下腹核心協調穩定"],
  avoid: defaultManualAvoidRules,
  status: "待重做",
  priority: "A",
};

export function ManualPromptEditor({ initialId, initialNumber }: { initialId?: string; initialNumber?: string }) {
  const initialItem = anatomyImages.find((item) => item.id === initialId || item.number === initialNumber) ?? blankItem;
  const [form, setForm] = useState<EditorForm>(() => toForm(initialItem));
  const [copied, setCopied] = useState(false);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [sourceImageName, setSourceImageName] = useState("");
  const [logoPosition, setLogoPosition] = useState<LogoPosition>("bottom-right");
  const [logoSize, setLogoSize] = useState<LogoSize>("small");
  const [overlayStatus, setOverlayStatus] = useState("請先上傳 AI 生成圖片");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const prompt = useMemo(() => buildManualAnatomyPrompt(fromForm(form)), [form]);

  function updateField<Key extends keyof EditorForm>(key: Key, value: EditorForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setSourceImageUrl(result);
      setSourceImageName(file.name);
      setDownloadUrl(null);
      setOverlayStatus(result ? "圖片已載入，可套用固定 BF Logo" : "圖片讀取失敗，請重新上傳");
    };
    reader.onerror = () => {
      setOverlayStatus("圖片讀取失敗，請重新上傳");
    };
    reader.readAsDataURL(file);
  }

  async function applyLogoOverlay() {
    if (!sourceImageUrl || !canvasRef.current) {
      setOverlayStatus("請先上傳 AI 生成圖片");
      return;
    }

    setOverlayStatus("正在套用固定 BF Logo…");

    try {
      const [sourceImage, logoImage] = await Promise.all([loadImage(sourceImageUrl), loadImage("/brand/bf-logo.svg")]);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) {
        setOverlayStatus("此瀏覽器不支援 Canvas 輸出");
        return;
      }

      const margin = 24;
      const logoWidth = logoWidthBySize[logoSize];
      const logoHeight = logoWidth * (logoImage.naturalHeight / logoImage.naturalWidth);
      const x = logoPosition.endsWith("right") ? sourceImage.naturalWidth - logoWidth - margin : margin;
      const y = logoPosition.startsWith("bottom") ? sourceImage.naturalHeight - logoHeight - margin : margin;

      canvas.width = sourceImage.naturalWidth;
      canvas.height = sourceImage.naturalHeight;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(sourceImage, 0, 0);
      context.drawImage(logoImage, x, y, logoWidth, logoHeight);

      const outputUrl = canvas.toDataURL("image/png");
      setDownloadUrl(outputUrl);
      setOverlayStatus("已套用固定 Logo，可下載 PNG");
    } catch {
      setOverlayStatus("Logo 套用失敗，請確認圖片格式後再試一次");
    }
  }

  return (
    <div className="anatomy-editor-grid">
      <form className="anatomy-editor-form">
        <div className="anatomy-form-row anatomy-form-row-compact">
          <label>
            圖號
            <input value={form.number} onChange={(event) => updateField("number", event.target.value)} />
          </label>
          <label>
            對應章節
            <select value={form.chapter} onChange={(event) => updateField("chapter", event.target.value)}>
              {Array.from(new Set(anatomyImages.map((item) => item.chapter))).map((chapter) => (
                <option key={chapter} value={chapter}>{chapter}</option>
              ))}
            </select>
          </label>
          <label>
            優先級
            <select value={form.priority} onChange={(event) => updateField("priority", event.target.value as EditorForm["priority"])}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </label>
        </div>

        <label>
          圖名
          <input value={form.titleZh} onChange={(event) => updateField("titleZh", event.target.value)} />
        </label>
        <label>
          英文副標
          <input value={form.titleEn} onChange={(event) => updateField("titleEn", event.target.value)} />
        </label>

        <div className="anatomy-form-row">
          <label>
            圖像用途
            <select value={form.usage} onChange={(event) => updateField("usage", event.target.value)}>
              <option value="manual-inner-page">Word / PDF 手冊內頁</option>
              <option value="chapter-opener">章節開場</option>
              <option value="presentation">簡報教材</option>
            </select>
          </label>
          <label>
            圖像類型
            <select value={form.imageType} onChange={(event) => updateField("imageType", event.target.value)}>
              <option value="教材版">教材版</option>
              <option value="品牌版">品牌版</option>
              <option value="IG 版">IG 版</option>
              <option value="流程圖">流程圖</option>
              <option value="案例圖">案例圖</option>
            </select>
          </label>
        </div>

        <div className="anatomy-form-row">
          <label>
            圖像比例
            <select value={form.ratio} onChange={(event) => updateField("ratio", event.target.value)}>
              <option value="4:3">4:3</option>
              <option value="A4 橫式">A4 橫式</option>
              <option value="A4 直式">A4 直式</option>
              <option value="9:16">9:16</option>
              <option value="1:1">1:1</option>
            </select>
          </label>
          <label>
            主視角（用頓號分隔）
            <input value={form.view} onChange={(event) => updateField("view", event.target.value)} />
          </label>
        </div>

        <label>
          主要骨頭（tag input MVP：用頓號、逗號或換行分隔）
          <textarea value={form.bones} onChange={(event) => updateField("bones", event.target.value)} />
        </label>
        <label>
          主要肌肉
          <textarea value={form.muscles} onChange={(event) => updateField("muscles", event.target.value)} />
        </label>
        <label>
          筋膜線 / 功能線
          <textarea value={form.fasciaLines} onChange={(event) => updateField("fasciaLines", event.target.value)} />
        </label>
        <label>
          必要標籤
          <textarea value={form.labels} onChange={(event) => updateField("labels", event.target.value)} />
        </label>
        <label>
          功能短句（一行一點）
          <textarea value={form.functionNotes} onChange={(event) => updateField("functionNotes", event.target.value)} />
        </label>
        <label>
          禁止元素（一行一點）
          <textarea value={form.avoid} onChange={(event) => updateField("avoid", event.target.value)} />
        </label>
      </form>

      <aside className="anatomy-prompt-panel">
        <div className="anatomy-prompt-panel-header">
          <div>
            <p>Generated Prompt</p>
            <h2>教材版標準提示詞</h2>
          </div>
          <button type="button" onClick={copyPrompt}>{copied ? "已複製" : "一鍵複製"}</button>
        </div>
        <pre>{prompt}</pre>
      </aside>

      <section className="anatomy-logo-overlay" aria-labelledby="logo-overlay-title">
        <div className="anatomy-section-heading">
          <p>Logo Overlay</p>
          <h2 id="logo-overlay-title">Logo Overlay｜固定品牌標記</h2>
        </div>
        <p className="anatomy-logo-note">
          Logo 不交給 AI 生成。所有 BF 標記皆由固定 SVG 後製疊加，以確保手冊全書一致。
        </p>

        <div className="anatomy-logo-controls">
          <label>
            上傳 AI 生成圖片
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </label>
          <label>
            Logo 位置
            <select value={logoPosition} onChange={(event) => setLogoPosition(event.target.value as LogoPosition)}>
              {logoPositions.map((position) => (
                <option key={position.value} value={position.value}>{position.label}</option>
              ))}
            </select>
          </label>
          <label>
            Logo 大小
            <select value={logoSize} onChange={(event) => setLogoSize(event.target.value as LogoSize)}>
              {logoSizes.map((size) => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>
          </label>
          <label>
            Logo 邊距
            <input value="24px" readOnly aria-label="固定 Logo 邊距 24px" />
          </label>
        </div>

        <div className="anatomy-logo-actions">
          <button type="button" onClick={applyLogoOverlay} disabled={!sourceImageUrl}>套用 Logo</button>
          <span>{sourceImageName || overlayStatus}</span>
        </div>

        <div className="anatomy-canvas-frame">
          <canvas ref={canvasRef} aria-label="已套用固定 BF Logo 的輸出預覽" />
        </div>
        <p className="anatomy-logo-status">{overlayStatus}</p>
        {downloadUrl ? (
          <a className="anatomy-download-link" href={downloadUrl} download={`${form.number}-${form.id}-bf-logo.png`}>
            下載加 Logo 後的 PNG
          </a>
        ) : null}
      </section>
    </div>
  );
}
