# BodyFix Content JSON Contract v0.1

**用途**：OpenAI、BodyFix OS、Manus 之間的固定交換格式。  
**原則**：同一份核准內容必須能被穩定重送、驗證、保存與追蹤。

---

## 1. Content Package 範例

```json
{
  "schemaVersion": "0.1",
  "projectCode": "BF-IG-001",
  "title": "為什麼按摩完，隔天又緊回來？",
  "contentType": "instagram_carousel",
  "platform": "instagram",
  "language": "zh-TW",
  "aspectRatio": "4:5",
  "objective": "建立 BodyFix 對反覆緊繃與張力分工的專業理解",
  "audience": [
    "久坐與長時間使用螢幕者",
    "按摩後容易再次緊繃者",
    "重訓後反覆出現同區域緊繃者"
  ],
  "coreMessage": "短暫放鬆不等於張力分工已經改變。",
  "hook": "為什麼按摩完，隔天又緊回來？",
  "slides": [
    {
      "page": 1,
      "role": "cover",
      "headline": "為什麼按摩完，隔天又緊回來？",
      "body": "",
      "keyPoint": "直擊常見痛點",
      "visualDirection": "象牙白背景、深墨藍解剖線稿、青銅金張力流線",
      "layout": "editorial_minimal",
      "whitespacePercent": 45
    }
  ],
  "caption": {
    "opening": "按摩完有比較鬆，隔天卻又回到原本的緊繃。",
    "body": "完整 Caption 內容",
    "cta": "留言或私訊描述你最常反覆緊繃的位置。"
  },
  "visualSystem": {
    "background": "ivory",
    "primary": "deep_navy",
    "accent": "bronze_gold",
    "illustrationStyle": "anatomical_line_art",
    "minimumWhitespacePercent": 35,
    "maximumWhitespacePercent": 50
  },
  "brandRules": [
    "使用繁體中文",
    "不得使用醫療診斷或治療承諾",
    "不得暗示越痛越有效",
    "使用低痛感、可呼吸、身體能接受的深度",
    "保留張力分工與 4R 方法語言"
  ],
  "safetyChecks": {
    "containsPersonalData": false,
    "containsMedicalClaim": false,
    "containsUnverifiedEvidence": false,
    "requiresHumanReview": true
  },
  "sourceNotes": [
    {
      "type": "brand_knowledge",
      "label": "BodyFix 核心語言",
      "summary": "以運動按摩為基礎，透過筋膜線判讀與張力分工整理。"
    }
  ],
  "openQuestions": [],
  "approvedVersionId": "UUID",
  "generatedAt": "2026-07-02T00:00:00Z"
}
```

---

## 2. TypeScript 型別

```ts
export type ContentType =
  | "instagram_carousel"
  | "instagram_reel"
  | "instagram_caption"
  | "story_sequence"
  | "article_outline";

export type SlideRole =
  | "cover"
  | "problem"
  | "mechanism"
  | "example"
  | "self_check"
  | "method"
  | "cta";

export interface ContentSlide {
  page: number;
  role: SlideRole;
  headline: string;
  body: string;
  keyPoint: string;
  visualDirection: string;
  layout: string;
  whitespacePercent: number;
}

export interface ContentPackage {
  schemaVersion: "0.1";
  projectCode: string;
  title: string;
  contentType: ContentType;
  platform: "instagram" | "facebook" | "website" | "line";
  language: "zh-TW";
  aspectRatio: "4:5" | "9:16" | "1:1" | "16:9";
  objective: string;
  audience: string[];
  coreMessage: string;
  hook: string;
  slides: ContentSlide[];
  caption: {
    opening: string;
    body: string;
    cta: string;
  };
  visualSystem: {
    background: string;
    primary: string;
    accent: string;
    illustrationStyle: string;
    minimumWhitespacePercent: number;
    maximumWhitespacePercent: number;
  };
  brandRules: string[];
  safetyChecks: {
    containsPersonalData: boolean;
    containsMedicalClaim: boolean;
    containsUnverifiedEvidence: boolean;
    requiresHumanReview: true;
  };
  sourceNotes: Array<{
    type: "brand_knowledge" | "research" | "case_summary" | "user_input";
    label: string;
    summary: string;
  }>;
  openQuestions: string[];
  approvedVersionId: string;
  generatedAt: string;
}
```

---

## 3. 必要驗證

- `schemaVersion` 必須等於 `0.1`
- `language` 必須等於 `zh-TW`
- `approvedVersionId` 不可為空
- `requiresHumanReview` 必須為 `true`
- Carousel 的 `slides` 至少 4 頁，最多 10 頁
- `page` 必須從 1 起連續編號
- `whitespacePercent` 必須介於 0 與 100
- `minimumWhitespacePercent` 不可大於 `maximumWhitespacePercent`
- `containsPersonalData=true` 時禁止送交 Manus
- `containsMedicalClaim=true` 時禁止核准
- `containsUnverifiedEvidence=true` 時必須退回人工檢查

---

## 4. Manus Payload

送交 Manus 時不要傳整個資料庫物件，只傳：

```json
{
  "idempotencyKey": "BF-IG-001:TEXT_APPROVED:3",
  "taskType": "bodyfix_visual_production",
  "contentPackage": {},
  "outputRequirements": {
    "format": "instagram_carousel",
    "aspectRatio": "4:5",
    "export": ["png", "pdf"],
    "previewRequired": true
  },
  "instructions": [
    "不得改寫已核准文案",
    "不得加入新的醫療主張",
    "不得自行補入客戶個資",
    "文字無法排版時應回報，不可擅自刪除核心句"
  ]
}
```

---

## 5. 回傳成果格式

```json
{
  "externalTaskId": "manus-task-id",
  "idempotencyKey": "BF-IG-001:TEXT_APPROVED:3",
  "status": "completed",
  "assets": [
    {
      "type": "preview",
      "url": "https://...",
      "mimeType": "image/png",
      "page": 1
    }
  ],
  "warnings": [],
  "completedAt": "2026-07-02T00:00:00Z"
}
```

外部 URL 不應直接視為永久資產。BodyFix OS 收到後，應依政策下載至自己的 Storage，或保存可驗證的外部參照。
