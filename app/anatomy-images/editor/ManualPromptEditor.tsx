"use client";

import { useMemo, useState } from "react";
import type { AnatomyImageItem } from "@/lib/anatomy-images";
import { anatomyImages, buildManualAnatomyPrompt, defaultManualAvoidRules } from "@/lib/anatomy-images";

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

export function ManualPromptEditor({ initialId }: { initialId?: string }) {
  const initialItem = anatomyImages.find((item) => item.id === initialId) ?? blankItem;
  const [form, setForm] = useState<EditorForm>(() => toForm(initialItem));
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(() => buildManualAnatomyPrompt(fromForm(form)), [form]);

  function updateField<Key extends keyof EditorForm>(key: Key, value: EditorForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
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
    </div>
  );
}
