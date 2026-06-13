"use client";

import { useState } from "react";
import Link from "next/link";
import { anatomyImages, buildManualAnatomyPrompt } from "@/lib/anatomy-images";
import { CopyPromptButton } from "./CopyPromptButton";

const statusOptions = ["全部", "待做", "已出圖", "待重做", "已定稿", "已保留"];
const chapterOptions = ["全部", ...Array.from(new Set(anatomyImages.map((item) => item.chapter)))];

function getWorkflowStatus(status: string) {
  const hasImage = ["已出圖", "已定稿", "已保留"].includes(status);
  const hasLogo = ["已定稿", "已保留"].includes(status);
  const isFinal = ["已定稿", "已保留"].includes(status);

  return [
    { label: "已生圖", done: hasImage },
    { label: "已套 Logo", done: hasLogo },
    { label: "已定稿", done: isFinal },
  ];
}

export default function AnatomyImagesPage() {
  const [chapterFilter, setChapterFilter] = useState("全部");
  const [statusFilter, setStatusFilter] = useState("全部");
  const filteredImages = anatomyImages.filter((item) => (chapterFilter === "全部" || item.chapter === chapterFilter) && (statusFilter === "全部" || item.status === statusFilter));
  const filterLabel = [chapterFilter, statusFilter].filter((value) => value !== "全部").join("｜") || "全部圖像";
  const statusCounts = anatomyImages.reduce<Record<string, number>>((counts, item) => {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <main className="anatomy-page">
      <section className="anatomy-hero">
        <div>
          <p className="anatomy-kicker">BF Anatomy Image Library</p>
          <h1>BodyFix 解剖教材內頁圖版系統</h1>
          <p>
            先做 MVP Prompt 控制台與固定 Logo 後製流程：AI 只產生解剖主圖與安全留白，
            BF Logo 一律使用固定 SVG 疊加，讓第一批 20 張教材圖全書一致。
          </p>
        </div>
        <div className="anatomy-hero-actions">
          <Link className="anatomy-primary-link" href="/anatomy-images/editor">
            開啟模板編輯器
          </Link>
          <Link className="anatomy-secondary-link" href="/anatomy-images/rules">
            查看規則庫
          </Link>
        </div>
      </section>

      <section className="anatomy-stats" aria-label="圖像狀態統計">
        {statusOptions.slice(1).map((status) => (
          <article key={status}>
            <span>{status}</span>
            <strong>{statusCounts[status] ?? 0}</strong>
          </article>
        ))}
      </section>

      <section className="anatomy-toolbar" aria-label="篩選提示">
        <div>
          <span>章節篩選</span>
          <div className="anatomy-chip-row">
            {chapterOptions.map((chapter) => (
              <button type="button" className={`anatomy-chip ${chapterFilter === chapter ? "is-active" : ""}`} onClick={() => setChapterFilter(chapter)} key={chapter}>{chapter}</button>
            ))}
          </div>
        </div>
        <div>
          <span>狀態篩選</span>
          <div className="anatomy-chip-row">
            {statusOptions.map((status) => (
              <button type="button" className={`anatomy-chip ${statusFilter === status ? "is-active" : ""}`} onClick={() => setStatusFilter(status)} key={status}>{status}</button>
            ))}
          </div>
        </div>
      </section>
      <p className="anatomy-filter-summary">目前篩選：{filterLabel}</p>

      <section className="anatomy-table-card" aria-labelledby="anatomy-list-title">
        <div className="anatomy-section-heading">
          <p>Image Library</p>
          <h2 id="anatomy-list-title">BF Pelvic Core 第一批 20 張圖</h2>
        </div>
        <div className="anatomy-table-wrap">
          <table className="anatomy-table">
            <thead>
              <tr>
                <th>縮圖</th>
                <th>編號</th>
                <th>圖名</th>
                <th>章節</th>
                <th>類型</th>
                <th>比例</th>
                <th>狀態</th>
                <th>流程狀態</th>
                <th>必要標籤</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredImages.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="anatomy-thumb" aria-label={`${item.titleZh} 縮圖佔位`}>
                      <span>BF</span>
                      <small>{item.number}</small>
                    </div>
                  </td>
                  <td>{item.number}</td>
                  <td>
                    <strong>{item.titleZh}</strong>
                    <small>{item.titleEn}</small>
                  </td>
                  <td>{item.chapter}</td>
                  <td>{item.imageType}</td>
                  <td>{item.ratio}</td>
                  <td>
                    <span className={`anatomy-status anatomy-status-${item.status}`}>{item.status}</span>
                  </td>
                  <td>
                    <div className="anatomy-workflow-status" aria-label={`${item.titleZh} 流程狀態`}>
                      {getWorkflowStatus(item.status).map((step) => (
                        <span className={step.done ? "is-complete" : undefined} key={step.label}>{step.label}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="anatomy-label-list">
                      {item.labels.slice(0, 4).map((label) => (
                        <span key={label}>{label}</span>
                      ))}
                      {item.labels.length > 4 ? <span>+{item.labels.length - 4}</span> : null}
                    </div>
                  </td>
                  <td>
                    <div className="anatomy-action-row">
                      <Link href={`/anatomy-images/editor?image=${item.number}`}>編輯模板</Link>
                      <CopyPromptButton prompt={buildManualAnatomyPrompt(item)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
