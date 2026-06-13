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
  | "place";

type IntakePayload = {
  name: string;
  line: string;
  phone: string;
  birthday: string;
  birthTime: string;
  birthPlace: string;
  time: string;
  note: string;
  selections: Record<ChoiceKey, string[]>;
  sunSign: string;
  ziweiStatus: string;
  stateTrend: string;
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
  service: ["筋膜鏈整理 60 分鐘", "筋膜鏈延長整理 90 分鐘", "骨盆核心整理 60 分鐘", "骨盆核心延長整理 90 分鐘", "12 次結構整合完整計畫", "我不確定，想先讓 Gavin 判斷"],
  place: ["西門", "國父紀念館", "六張犁", "到府整理", "台中場次", "高雄場次", "其他城市"],
};

const multiChoice: Partial<Record<ChoiceKey, boolean>> = {
  goal: true,
  location: true,
  history: true,
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
    `生日：${payload.birthday}`,
    `太陽星座：${payload.sunSign}`,
    `出生時間：${payload.birthTime}`,
    `出生地：${payload.birthPlace}`,
    `延伸資料狀態：${payload.ziweiStatus}`,
    `這次最想處理：${payload.selections.goal.join("、")}`,
    `主要位置：${payload.selections.location.join("、")}`,
    `持續時間：${payload.selections.duration[0] || ""}`,
    `目前感受程度：${payload.selections.comfort[0] || ""}`,
    `過去處理方式：${payload.selections.history.join("、")}`,
    "狀態小測驗：",
    `最近狀態：${payload.selections.stateRecent[0] || ""}`,
    `最想改善：${payload.selections.stateImprove[0] || ""}`,
    `期待感覺：${payload.selections.stateFeeling[0] || ""}`,
    `初步狀態傾向：${payload.stateTrend}`,
    `想預約服務：${payload.selections.service[0] || ""}`,
    `希望地點：${payload.selections.place[0] || ""}`,
    `希望時間：${payload.time}`,
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
      birthday,
      birthTime,
      birthPlace,
      time: String(formData.get("time") || ""),
      note: String(formData.get("note") || ""),
      selections,
      sunSign,
      ziweiStatus,
      stateTrend,
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
            <label>稱呼<input name="name" required placeholder="暱稱就好" /></label>
            <label>LINE ID<input name="line" placeholder="方便 Gavin 確認預約" /></label>
            <label>手機 / 聯絡方式<input name="phone" placeholder="選填，若 LINE 不方便可留" /></label>
            <label>生日<input name="birthday" type="date" value={birthday} onChange={(event) => setBirthday(event.target.value)} /></label>
            <p className="intake-hint">你的太陽星座：{sunSign || "＿＿座"}</p>
            <label>出生時間（選填）<input name="birthTime" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} placeholder="例如：上午 9:30，不知道也可以留空" /></label>
            <label>出生地（選填）<input name="birthPlace" value={birthPlace} onChange={(event) => setBirthPlace(event.target.value)} placeholder="例如：台北、台中、高雄" /></label>
            <p className="intake-hint">{ziweiStatus}</p>
          </section>

          <section className="intake-card">
            <h2>身體狀態</h2>
            <ChoiceGroup label="這次最想處理的問題？" group="goal" selections={selections} onToggle={toggleChoice} />
            <ChoiceGroup label="主要卡住或不舒服的位置？" group="location" selections={selections} onToggle={toggleChoice} />
            <ChoiceGroup label="這個狀況持續多久？" group="duration" selections={selections} onToggle={toggleChoice} />
            <ChoiceGroup label="目前感受程度？" group="comfort" selections={selections} onToggle={toggleChoice} score />
            <p className="intake-hint">0 是幾乎沒有感覺，10 是非常明顯。</p>
            <ChoiceGroup label="過去做過哪些處理？" group="history" selections={selections} onToggle={toggleChoice} />
          </section>

          <section className="intake-card">
            <h2>BodyFix 狀態小測驗</h2>
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
            <label>希望預約的時間？<input name="time" placeholder="例如：平日晚上、週末下午、這週三晚上" /></label>
            <label>補充說明<textarea name="note" placeholder="例如：怕痛、最近有比賽、剛開始重訓、某個動作會卡、想先聊聊方案。" /></label>
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
