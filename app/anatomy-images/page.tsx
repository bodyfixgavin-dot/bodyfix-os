"use client";

import { useMemo, useState } from "react";
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

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      aria-pressed={active}
      className={`anatomy-chip anatomy-filter-chip${active ? " is-active" : ""}`}
      type="button"
      onClick={onClick}
    >
      {active ? <span className="anatomy-chip-dot" aria-hidden="true" /> : null}
      {label}
    </button>
  );
}

export default function AnatomyImagesPage() {
  const [selectedChapter, setSelectedChapter] = useState("全部");
  const [selectedStatus, setSelectedStatus] = useState("全部");

  const statusCounts = anatomyImages.reduce<Record<string, number>>((counts, item) => {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
    return counts;
  }, {});

  const filteredImages = useMemo(() => {
    return anatomyImages.filter((item) => {
      const chapterMatched = selectedChapter === "全部" || item.chapter === selectedChapter;
      const statusMatched = selectedStatus === "全部" || item.status === selectedStatus;
      return chapterMatched && statusMatched;
    });
  }, [selectedChapter, selectedStatus]);

  const filterSummary =
    selectedChapter === "全部" && selectedStatus === "全部"
      ? "目前篩選：全部圖像"
      : `目前篩選：${selectedChapter === "全部" ? "全部章節" : `章節 ${selectedChapter}`}｜${selectedStatus === "全部" ? "全部狀態" : `狀態 ${selectedStatus}`}`;

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

      <section className="anatomy-toolbar" aria-label="篩選控制">
        <div className="anatomy-filter-card">
          <span>章節篩選</span>
          <div className="anatomy-chip-row" role="group" aria-label="章節篩選">
            {chapterOptions.map((chapter) => (
              <FilterChip
                active={selectedChapter === chapter}
                key={chapter}
                label={chapter}
                onClick={() => setSelectedChapter(chapter)}
              />
            ))}
          </div>
        </div>
        <div className="anatomy-filter-card">
          <span>狀態篩選</span>
          <div className="anatomy-chip-row" role="group" aria-label="狀態篩選">
            {statusOptions.map((status) => (
              <FilterChip
                active={selectedStatus === status}
                key={status}
                label={status}
                onClick={() => setSelectedStatus(status)}
              />
            ))}
          </div>
        </div>
        <p className="anatomy-filter-summary">{filterSummary}（共 {filteredImages.length} 張）</p>
      </section>

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
                      <Link href={`/anatomy-images/editor?id=${item.id}`}>編輯</Link>
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
