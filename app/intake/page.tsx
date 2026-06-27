"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type ChoiceKey =
  | "goal"
  | "location"
  | "duration"
  | "comfort"
  | "history"
  | "stateRecent"
  | "stateImprove"
  | "stateFeeling"
  | "service"
  | "place"
  | "triggerMoment"
  | "exerciseFrequency"
  | "exerciseTypes"
  | "trainerStatus"
  | "safetyFlags"
  | "pressurePreferences"
  | "availableTimes"
  | "lastMinute";

type IntakePayload = {
  name: string;
  line: string;
  phone: string;
  instagram: string;
  birthday: string;
  birthTime: string;
  birthPlace: string;
  time: string;
  note: string;
  selections: Record<ChoiceKey, string[]>;
  safetyNote: string;
  pressureNote: string;
  chartInterest: string;
  birthDataLevel: string;
  sunSign: string;
  ziweiStatus: string;
  stateTrend: string;
  consent: boolean;
};

const choices: Record<ChoiceKey, string[]> = {
  goal: ["肩頸緊", "胸口卡", "腰背硬撐", "骨盆 / 髖卡住", "運動後恢復差", "姿勢不對稱", "睡不好 / 放鬆不了", "想做筋膜鏈整理", "想做骨盆核心整理", "還不確定"],
  location: ["頭 / 頸", "肩膀", "上背", "胸口 / 肋骨", "下背", "骨盆", "髖", "臀腿", "膝蓋", "腳踝 / 足底", "手臂", "全身緊繃"],
  duration: ["今天才開始", "一週內", "一個月內", "三個月以上", "半年以上", "反覆很久了"],
  comfort: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  history: ["沒有", "一般按摩", "運動按摩", "整復 / 推拿", "曾尋求專業協助", "自己伸展", "重訓調整", "滾筒 / 筋膜球", "其他"],
  stateRecent: ["腦袋停不下來", "身體很緊但不知道哪裡緊", "一直硬撐，不太會放鬆", "運動後恢復變慢", "情緒有點悶，但說不清楚", "只是想整理一下身體狀態"],
  stateImprove: ["睡得比較好", "肩頸腰背不要一直卡", "訓練表現更穩", "身體不要那麼容易累", "情緒和身體都放鬆一點", "想知道自己目前的狀態"],
  stateFeeling: ["鬆一點", "穩一點", "有力量一點", "呼吸順一點", "頭腦安靜一點", "重新整理自己"],
  service: ["筋膜鏈整理｜60 分鐘｜NT$2,200", "筋膜線指定整理｜60 分鐘｜NT$2,300", "多線整合整理｜90 分鐘｜NT$3,600", "骨盆核心整理｜60 分鐘｜NT$2,500", "骨盆核心深度完整方案｜120 分鐘｜NT$6,800，需事前評估", "不確定，想先請 Gavin 判斷"],
  place: ["西門", "國父紀念館", "六張犁", "到府整理", "台中場次", "高雄場次", "其他城市"],
  triggerMoment: ["久坐後", "久站後", "工作時", "運動中", "運動後", "睡醒時", "晚上", "不固定"],
  exerciseFrequency: ["幾乎沒有", "偶爾活動", "每週 1 次", "每週 2～3 次", "每週 4 次以上"],
  exerciseTypes: ["重訓", "教練課", "跑步", "球類", "游泳", "拳擊／格鬥", "瑜伽／皮拉提斯", "工作活動量高", "其他"],
  trainerStatus: ["有固定教練", "沒有", "曾經有", "自己就是教練"],
  safetyFlags: ["沒有", "最近急性受傷", "手術或恢復中", "持續麻木或明顯無力", "醫師交代限制活動", "有傷口或不適合接觸的位置", "其他"],
  pressurePreferences: ["一般即可", "比較怕痛", "容易瘀青", "希望先從輕一點開始", "有不希望接觸的位置", "現場再討論"],
  availableTimes: ["平日上午", "平日下午", "平日晚上", "深夜時段", "週末白天", "週末晚上", "時間彈性", "有特定日期"],
  lastMinute: ["可以", "不用", "視情況"],
};

const multiChoice: Partial<Record<ChoiceKey, boolean>> = {
  goal: true,
  location: true,
  history: true,
  triggerMoment: true,
  exerciseTypes: true,
  safetyFlags: true,
  pressurePreferences: true,
  availableTimes: true,
};

function emptySelections(): Record<ChoiceKey, string[]> {
  return Object.fromEntries(Object.keys(choices).map((key) => [key, []])) as Record<ChoiceKey, string[]>;
}

function getSunSign(dateText: string) {
  if (!dateText) return "";
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return "";
  const md = (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
  if (md >= 321 && md <= 419) return "牡羊座";
  if (md >= 420 && md <= 520) return "金牛座";
  if (md >= 521 && md <= 620) return "雙子座";
  if (md >= 621 && md <= 722) return "巨蟹座";
  if (md >= 723 && md <= 822) return "獅子座";
  if (md >= 823 && md <= 922) return "處女座";
  if (md >= 923 && md <= 1022) return "天秤座";
  if (md >= 1023 && md <= 1121) return "天蠍座";
  if (md >= 1122 && md <= 1221) return "射手座";
  if (md >= 1222 || md <= 119) return "摩羯座";
  if (md >= 120 && md <= 218) return "水瓶座";
  return "雙魚座";
}

function getZiweiStatus(birthday: string, birthTime: string, birthPlace: string) {
  if (!birthday) return "填寫生日後，可建立生日提醒與基本狀態資料。";
  if (birthTime && birthPlace) return "資料完整，未來可作為延伸狀態分析參考。";
  return "已可建立生日資料；若未來需要延伸狀態分析，可再補出生時間與出生地。";
}

function getStateType(stateRecent?: string, stateImprove?: string, stateFeeling?: string) {
  const combinationRules = [
    { recent: "一直硬撐，不太會放鬆", improve: "睡得比較好", feeling: "頭腦安靜一點", type: "硬撐 / 壓力恢復型" },
    { recent: "運動後恢復變慢", improve: "訓練表現更穩", feeling: "有力量一點", type: "訓練恢復 / 動作表現型" },
    { recent: "情緒有點悶，但說不清楚", improve: "想知道自己目前的狀態", feeling: "重新整理自己", type: "狀態整理 / 自我覺察型" },
    { recent: "身體很緊但不知道哪裡緊", improve: "肩頸腰背不要一直卡", feeling: "鬆一點", type: "筋膜張力 / 卡住覺察型" },
    { recent: "腦袋停不下來", improve: "情緒和身體都放鬆一點", feeling: "呼吸順一點", type: "壓力節奏 / 呼吸調節型" },
  ];
  const matchedRule = combinationRules.find((rule) => rule.recent === stateRecent && rule.improve === stateImprove && rule.feeling === stateFeeling);
  if (matchedRule) return matchedRule.type;
  const fallbackTypes: Record<string, string> = {
    "一直硬撐，不太會放鬆": "硬撐 / 壓力恢復型",
    "運動後恢復變慢": "訓練恢復 / 動作表現型",
    "情緒有點悶，但說不清楚": "狀態整理 / 自我覺察型",
    "身體很緊但不知道哪裡緊": "筋膜張力 / 卡住覺察型",
    "腦袋停不下來": "壓力節奏 / 呼吸調節型",
  };
  return (stateRecent && fallbackTypes[stateRecent]) || "綜合狀態 / 現場判讀";
}

function buildMessage(payload: IntakePayload) {
  const lines = [
    "BodyFix 預約前狀態整理表",
    `稱呼：${payload.name}`,
    `LINE ID：${payload.line}`,
    `手機：${payload.phone}`,
    `Instagram：${payload.instagram}`,
    `生日：${payload.birthday}`,
    `太陽星座：${payload.sunSign}`,
    `出生時間：${payload.birthTime}`,
    `出生地：${payload.birthPlace}`,
    `chart_interest：${payload.chartInterest}`,
    `birth_data_level：${payload.birthDataLevel}`,
    `延伸資料狀態：${payload.ziweiStatus}`,
    `這次最想處理：${payload.selections.goal.join("、")}`,
    `主要位置：${payload.selections.location.join("、")}`,
    `持續時間：${payload.selections.duration[0] || ""}`,
    `目前感受程度：${payload.selections.comfort[0] || ""}`,
    `過去處理方式：${payload.selections.history.join("、")}`,
    `容易發生時機：${payload.selections.triggerMoment.join("、")}`,
    `運動頻率：${payload.selections.exerciseFrequency[0] || ""}`,
    `運動類型：${payload.selections.exerciseTypes.join("、")}`,
    `教練狀態：${payload.selections.trainerStatus[0] || ""}`,
    `安全提醒：${payload.selections.safetyFlags.join("、")} ${payload.safetyNote}`,
    `力道偏好：${payload.selections.pressurePreferences.join("、")} ${payload.pressureNote}`,
    "狀態小測驗：",
    `最近狀態：${payload.selections.stateRecent[0] || ""}`,
    `最想改善：${payload.selections.stateImprove[0] || ""}`,
    `期待感覺：${payload.selections.stateFeeling[0] || ""}`,
    `初步狀態傾向：${payload.stateTrend}`,
    `想預約服務：${payload.selections.service[0] || ""}`,
    `希望地點：${payload.selections.place[0] || ""}`,
    `可行時段：${payload.selections.availableTimes.join("、")}`,
    `接受臨時釋出：${payload.selections.lastMinute[0] || ""}`,
    `特定日期：${payload.time}`,
    `補充說明：${payload.note}`,
  ];
  return lines.join("\n");
}

export default function IntakePage() {
  const [selections, setSelections] = useState<Record<ChoiceKey, string[]>>(emptySelections);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [statusText, setStatusText] = useState("");
  const [birthday, setBirthday] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [chartInterest, setChartInterest] = useState<"curious" | "later" | "not_now" | "not_selected">("not_selected");

  const sunSign = useMemo(() => getSunSign(birthday), [birthday]);
  const ziweiStatus = useMemo(() => getZiweiStatus(birthday, birthTime, birthPlace), [birthday, birthTime, birthPlace]);
  const stateTrend = useMemo(
    () => getStateType(selections.stateRecent[0], selections.stateImprove[0], selections.stateFeeling[0]),
    [selections.stateFeeling, selections.stateImprove, selections.stateRecent]
  );

  function toggleChoice(group: ChoiceKey, value: string) {
    setSelections((current) => {
      const isMulti = multiChoice[group];
      const existing = current[group];
      const nextValue = isMulti
        ? existing.includes(value)
          ? existing.filter((item) => item !== value)
          : [...existing, value]
        : existing[0] === value
          ? []
          : [value];
      return { ...current, [group]: nextValue };
    });
  }

  async function submitIntake(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (!String(formData.get("line") || "").trim() && !String(formData.get("phone") || "").trim() && !String(formData.get("instagram") || "").trim()) {
      setStatus("error");
      setStatusText("請至少留下 LINE ID、手機或 Instagram 其中一種聯絡方式。");
      return;
    }
    if (formData.get("consent") !== "on") {
      setStatus("error");
      setStatusText("請先勾選同意資料使用說明。");
      return;
    }

    const missing = [
      { key: "stateRecent" as const, label: "最近狀態" },
      { key: "stateImprove" as const, label: "最想改善" },
      { key: "stateFeeling" as const, label: "期待感覺" },
    ].filter((item) => selections[item.key].length === 0);
    if (missing.length) {
      setStatus("error");
      setStatusText(`請先完成狀態小測驗：${missing.map((item) => item.label).join("、")}`);
      return;
    }

    const payload: IntakePayload = {
      name: String(formData.get("name") || ""),
      line: String(formData.get("line") || ""),
      phone: String(formData.get("phone") || ""),
      instagram: String(formData.get("instagram") || ""),
      birthday,
      birthTime,
      birthPlace,
      time: String(formData.get("time") || ""),
      note: String(formData.get("note") || ""),
      selections,
      safetyNote: String(formData.get("safetyNote") || ""),
      pressureNote: String(formData.get("pressureNote") || ""),
      chartInterest,
      birthDataLevel: !birthday ? "none" : birthTime && birthPlace ? "full" : "date_only",
      sunSign,
      ziweiStatus,
      stateTrend,
      consent: true,
    };

    setStatus("submitting");
    setStatusText("正在送出，請稍候…");
    try {
      const message = buildMessage(payload);
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, message }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "送出失敗");
      try {
        await navigator.clipboard.writeText(message);
      } catch {}
      setStatus("success");
      setStatusText(json.stored ? "已送出，Gavin 可在後台查看這份問卷。也已嘗試複製內容，方便你貼到 LINE。" : "已送出完成。系統目前尚未連接資料庫，但已顯示完成狀態並嘗試複製內容。未來可接到後台列表。");
    } catch (error) {
      setStatus("error");
      setStatusText(error instanceof Error ? error.message : "送出失敗，請稍後再試。也可以截圖或複製內容傳給 Gavin。");
    }
  }

  return (
    <main className="intake-page">
      <div className="intake-shell">
        <header className="intake-hero">
          <Link className="intake-brand" href="/" aria-label="回到 BodyFix OS 首頁">
            <span className="bf-logo-box">BF</span>
            <span>BodyFix</span>
          </Link>
          <p className="intake-eyebrow">Public Intake Entry</p>
          <h1>BodyFix 預約前狀態整理表</h1>
          <p className="intake-lead">第一次預約前，請先簡單填寫目前的身體狀態。這份資料會幫助 Gavin 在服務前先了解你的需求，現場更快進入判讀與整理。</p>
          <p className="intake-note">這是公開填寫入口，不會顯示任何 BodyFix 後台資料。內容僅作為預約前溝通與狀態整理參考。</p>
        </header>

        <form className="intake-form" onSubmit={submitIntake}>
          <section className="intake-card">
            <h2>基本資料</h2>
            <label>稱呼 / 目前習慣使用的名字<input name="name" required placeholder="暱稱就好" /></label>
            <label>LINE ID<input name="line" placeholder="至少留一種聯絡方式" /></label>
            <label>手機<input name="phone" placeholder="至少留一種聯絡方式" /></label>
            <label>Instagram<input name="instagram" placeholder="至少留一種聯絡方式" /></label>
            <label>出生日期<input name="birthday" type="date" value={birthday} onChange={(event) => setBirthday(event.target.value)} /></label>
            <p className="intake-hint">填寫後可顯示你的太陽星座，也能協助 BodyFix 辨認既有紀錄。再補出生時間與出生地，可延伸了解上升星座、紫微斗數等個人結構資料。</p>
            <p className="intake-hint">出生資料為自由填寫，未填寫不影響 BodyFix 預約。</p>
            {birthday && <p className="intake-hint">你的太陽星座：{sunSign}</p>}
            {birthday && <div className="intake-options">{[["curious", "有點好奇，繼續看看"], ["later", "之後再補"], ["not_now", "這次先不用"]].map(([value, label]) => <button className={chartInterest === value ? "intake-chip active" : "intake-chip"} key={value} type="button" onClick={() => setChartInterest(value as typeof chartInterest)}>{label}</button>)}</div>}
            {chartInterest === "curious" && <>
              <label>出生時間（選填）<input name="birthTime" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} placeholder="例如：上午 9:30" /></label>
              <button className="intake-chip" type="button" onClick={() => setBirthTime("不知道出生時間")}>不知道出生時間</button>
              <label>出生地（選填）<input name="birthPlace" value={birthPlace} onChange={(event) => setBirthPlace(event.target.value)} placeholder="例如：台北、台中、高雄" /></label>
              <p className="intake-hint">{ziweiStatus}</p>
            </>}
          </section>

          <section className="intake-card">
            <h2>身體狀態</h2>
            <ChoiceGroup label="這次最想處理的問題？" group="goal" selections={selections} onToggle={toggleChoice} />
            <ChoiceGroup label="主要卡住或不舒服的位置？" group="location" selections={selections} onToggle={toggleChoice} />
            <ChoiceGroup label="這個狀況持續多久？" group="duration" selections={selections} onToggle={toggleChoice} />
            <ChoiceGroup label="目前感受程度？" group="comfort" selections={selections} onToggle={toggleChoice} score />
            <p className="intake-hint">0 是幾乎沒有感覺，10 是非常明顯。</p>
            <ChoiceGroup label="過去做過哪些處理？" group="history" selections={selections} onToggle={toggleChoice} />
            <ChoiceGroup label="通常什麼時候比較明顯？" group="triggerMoment" selections={selections} onToggle={toggleChoice} />
          </section>

          <section className="intake-card">
            <h2>運動狀態</h2>
            <ChoiceGroup label="目前運動頻率" group="exerciseFrequency" selections={selections} onToggle={toggleChoice} />
            <ChoiceGroup label="運動類型" group="exerciseTypes" selections={selections} onToggle={toggleChoice} />
            <ChoiceGroup label="教練狀態" group="trainerStatus" selections={selections} onToggle={toggleChoice} />
          </section>

          <section className="intake-card">
            <h2>服務前確認</h2>
            <ChoiceGroup label="安全提醒" group="safetyFlags" selections={selections} onToggle={toggleChoice} />
            {selections.safetyFlags.some((item) => item === "其他") && <label>安全提醒補充<input name="safetyNote" /></label>}
            <ChoiceGroup label="力道與接觸偏好" group="pressurePreferences" selections={selections} onToggle={toggleChoice} />
            {selections.pressurePreferences.some((item) => item === "其他" || item === "有不希望接觸的位置") && <label>力道與接觸補充<input name="pressureNote" /></label>}
          </section>

          <section className="intake-card">
            <h2>本次恢復方向</h2>
            <p className="intake-hint">不用想太多，選最接近你現在的狀態就好。這不是心理判讀，只是幫 Gavin 在見面前更快理解你的身體與壓力狀態。</p>
            <ChoiceGroup label="你最近比較像哪一種？" group="stateRecent" selections={selections} onToggle={toggleChoice} />
            <ChoiceGroup label="你最想改善的是什麼？" group="stateImprove" selections={selections} onToggle={toggleChoice} />
            <ChoiceGroup label="你希望這次整理帶給你什麼感覺？" group="stateFeeling" selections={selections} onToggle={toggleChoice} />
            <div className="intake-result">初步狀態傾向：{stateTrend}</div>
          </section>

          <section className="intake-card">
            <h2>預約偏好</h2>
            <ChoiceGroup label="這次想預約哪一種？" group="service" selections={selections} onToggle={toggleChoice} />
            <ChoiceGroup label="希望在哪裡預約？" group="place" selections={selections} onToggle={toggleChoice} />
            <ChoiceGroup label="可行時段" group="availableTimes" selections={selections} onToggle={toggleChoice} />
            {selections.availableTimes.includes("有特定日期") && <label>特定日期<input name="time" placeholder="例如：這週三晚上" /></label>}
            <ChoiceGroup label="接受臨時釋出" group="lastMinute" selections={selections} onToggle={toggleChoice} />
            <label>補充說明<textarea name="note" placeholder="例如：怕痛、最近有比賽、剛開始重訓、某個動作會卡、想先聊聊方案。" /></label>
          </section>

          <section className="intake-card">
            <h2>同意</h2>
            <label className="intake-consent"><input name="consent" type="checkbox" required />我同意 BodyFix 使用本次填寫資料，作為預約聯繫、服務前需求了解、紀錄整理與後續追蹤使用。</label>
            <details><summary>完整資料使用說明</summary><p className="intake-hint">資料僅供 BodyFix 預約聯繫、服務前需求了解、客戶紀錄整理與後續追蹤使用；出生資料為自由填寫，未填寫不影響預約。</p></details>
          </section>

          {statusText && <div className={status === "success" ? "intake-success" : "intake-alert"}>{statusText}</div>}
          <button className="intake-submit" type="submit" disabled={status === "submitting"}>{status === "submitting" ? "送出中…" : "送出預約前狀態整理表"}</button>
        </form>
      </div>
    </main>
  );
}

function ChoiceGroup({ label, group, selections, onToggle, score = false }: { label: string; group: ChoiceKey; selections: Record<ChoiceKey, string[]>; onToggle: (group: ChoiceKey, value: string) => void; score?: boolean }) {
  return (
    <div className="intake-fieldset">
      <p>{label}</p>
      <div className={score ? "intake-score-grid" : "intake-options"}>
        {choices[group].map((value) => (
          <button className={selections[group].includes(value) ? "intake-chip active" : "intake-chip"} key={value} type="button" onClick={() => onToggle(group, value)}>
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
