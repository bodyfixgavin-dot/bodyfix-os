"use client";

import { useMemo, useState } from "react";
import { ClinicNotice, ClinicShell, useClinicFetch } from "@/components/clinic/ClinicShell";
import styles from "./codebook.module.css";

type Category = {
  id: string;
  category_key: string;
  category_name_zh: string;
  category_name_en: string | null;
  is_active: boolean;
};

type Item = {
  id: string;
  category_key: string;
  code: string;
  name_zh: string;
  name_en: string | null;
  description: string | null;
  quick_filter_code: string | null;
  group_key: string | null;
  is_active: boolean;
  is_coming_soon: boolean;
  is_deprecated: boolean;
};

type Data = { categories: Category[]; items: Item[] };

function Flag({ active, children }: { active: boolean; children: React.ReactNode }) {
  return <span className={`${styles.flag}${active ? ` ${styles.on}` : ""}`}>{children}: {active ? "yes" : "no"}</span>;
}

export default function CodebookDashboard() {
  const { data, loading, error, diagnostics } = useClinicFetch<Data>("/api/clinic/codebook");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const items = useMemo(() => data?.items.filter((item) => selectedCategory === "ALL" || item.category_key === selectedCategory) ?? [], [data, selectedCategory]);
  const summary = useMemo(() => ({
    categories: data?.categories.length ?? 0,
    items: data?.items.length ?? 0,
    active: data?.items.filter((item) => item.is_active).length ?? 0,
    comingSoon: data?.items.filter((item) => item.is_coming_soon).length ?? 0
  }), [data]);

  return <ClinicShell title="Codebook 代碼字典" subtitle="唯讀檢視 BodyFix v0.2.1 標準選單、內部代碼與 coming-soon 項目。">
    <ClinicNotice loading={loading} error={error} diagnostics={diagnostics} />
    {data ? <>
      <section className={`${styles.summary} bf-section-gap`} aria-label="Codebook 統計摘要">
        <div><span>Categories</span><strong>{summary.categories}</strong><small>字典分類</small></div>
        <div><span>Items</span><strong>{summary.items}</strong><small>全部代碼</small></div>
        <div><span>Active</span><strong>{summary.active}</strong><small>啟用項目</small></div>
        <div><span>Coming soon</span><strong>{summary.comingSoon}</strong><small>尚未啟用功能</small></div>
      </section>
      <section className="bf-card bf-section-gap">
        <div className={styles.sectionHead}><div><span>Category filter</span><h2 className="bf-section-title">分類篩選</h2></div><strong>{items.length} items</strong></div>
        <div className={styles.filters}>
          <button className={selectedCategory === "ALL" ? styles.active : undefined} type="button" onClick={() => setSelectedCategory("ALL")}>ALL</button>
          {data.categories.map((category) => <button className={selectedCategory === category.category_key ? styles.active : undefined} type="button" key={category.id} onClick={() => setSelectedCategory(category.category_key)}>{category.category_key}<small>{category.category_name_zh}</small></button>)}
        </div>
      </section>
      <section className={`${styles.list} bf-section-gap`} aria-label="Codebook items">
        {items.map((item) => <article className={styles.item} key={item.id}>
          <header><div><code>{item.code}</code><h3>{item.name_zh}</h3><p>{item.name_en ?? "—"}</p></div><span>{item.category_key}</span></header>
          <dl>
            <div><dt>quick_filter_code</dt><dd>{item.quick_filter_code ?? "—"}</dd></div>
            <div><dt>group_key</dt><dd>{item.group_key ?? "—"}</dd></div>
            <div className={styles.description}><dt>description</dt><dd>{item.description ?? "—"}</dd></div>
          </dl>
          <footer><Flag active={item.is_active}>active</Flag><Flag active={item.is_coming_soon}>coming soon</Flag><Flag active={item.is_deprecated}>deprecated</Flag></footer>
        </article>)}
      </section>
    </> : null}
  </ClinicShell>;
}
