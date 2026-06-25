"use client";

import { FormEvent, useMemo, useState } from "react";

const routeOptions = ["方法認識", "能力銜接", "BodyFix 方法實作", "Pilot 個別導入", "尚未確定，希望 Gavin 協助建議"];
const contactPlaceholders = { LINE: "請填寫 LINE 顯示名稱、LINE ID，或其他能辨識你的方式", Instagram: "請填寫 Instagram 帳號", Email: "請填寫 Email" };

export function MethodInterestForm() {
  const [route, setRoute] = useState(routeOptions[3]);
  const [contactMethod, setContactMethod] = useState<keyof typeof contactPlaceholders>("LINE");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const contactPlaceholder = useMemo(() => contactPlaceholders[contactMethod], [contactMethod]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("interested_route", route);
    formData.set("contact_method", contactMethod);
    try {
      const response = await fetch("/api/method-interest", { method: "POST", body: formData });
      if (!response.ok) throw new Error("submit failed");
      form.reset();
      setRoute(routeOptions[3]);
      setContactMethod("LINE");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return <form className="method-form" onSubmit={onSubmit}>
    <label>姓名<input required name="name" placeholder="姓名或希望被稱呼的名字" /></label>
    <label>職業背景<select required name="professional_background" defaultValue=""><option value="" disabled>請選擇</option>{["教練", "按摩或徒手服務", "美業工作者", "醫護或健康相關工作", "運動訓練者", "目前沒有相關背景", "其他"].map((v) => <option key={v}>{v}</option>)}</select></label>
    <label>想了解的入口<select required name="interested_route" value={route} onChange={(e) => setRoute(e.target.value)}>{routeOptions.map((v) => <option key={v}>{v}</option>)}</select></label>
    <label>希望的聯絡方式<select required name="contact_method" value={contactMethod} onChange={(e) => setContactMethod(e.target.value as keyof typeof contactPlaceholders)}>{Object.keys(contactPlaceholders).map((v) => <option key={v}>{v}</option>)}</select></label>
    <label className="method-wide">聯絡資料<input required name="contact_value" placeholder={contactPlaceholder} type={contactMethod === "Email" ? "email" : "text"} /></label>
    <label className="method-wide">最想解決的學習問題<textarea name="learning_question" placeholder="例如：不知道如何做進場判讀、手法容易做太深、不知道如何回測、想整理自己的服務流程。" /></label>
    <div className="method-consent method-wide"><p>Pilot 產出包含個人能力回饋、適合的學習路線建議與試行參與紀錄。試行參與紀錄不是完課證明、方法認證或品牌授權。</p><p>送出資料僅用於 BodyFix Method 課程聯絡、學習需求判斷與後續通知，不會公開顯示。</p><label><input required name="consent" type="checkbox" value="true" />我已閱讀並同意以上資料使用說明。</label></div>
    <button disabled={status === "sending"} className="method-btn method-btn-primary method-wide">{status === "sending" ? "正在送出…" : "送出 Pilot 登記"}</button>
    {status === "success" ? <p className="method-success method-wide">已收到你的登記。Gavin 會依你留下的聯絡方式回覆。</p> : null}
    {status === "error" ? <p className="method-error method-wide">目前無法送出，可能是登記資料庫尚未連線或暫時不可用，請稍後再試。</p> : null}
  </form>;
}
