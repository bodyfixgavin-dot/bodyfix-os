"use client";

import { useMemo, useState } from "react";
import { ClinicNotice, ClinicShell, useClinicFetch } from "@/components/clinic/ClinicShell";
import styles from "./CodebookDashboard.module.css";

type Category = {
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

type CodebookData = { categories: Category[]; items: Item[] };

function StatusFlag({ active, children }: { active: boolean; children: React.ReactNode }) {
  return <span className={`${styles.flag} ${active ? styles.flagOn : ""}`}>{children}</span>;
}

export default function CodebookDashboard() {
  const { data, loading, error, diagnostics } = useClinicFetch<CodebookData>("/api/clinic/codebook");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const items = useMemo(() => data?.items.filter((item) => selectedCategory === "ALL" || item.category_key === selectedCategory) ?? [], [data, selectedCategory]);

  return <ClinicShell title="Codebook 代碼字典" subtitle="唯讀查看 BodyFix 服務、方案、任務、張力與其他標準代碼；新增與編輯功能留待後續版本。">
    <ClinicNotice loading={loading} error={error} diagnostics={diagnostics} />
    {data && <>
      <section className={`${styles.summary} bf-section-gap`} aria-label="Codebook 統計摘要">
        <div><span>Categories</span><strong>{data.categories.length}</strong><small>字典分類</small></div>
        <div><span>Items</span><strong>{data.items.length}</strong><small>全部代碼</small></div>
        <div><span>Active</span><strong>{data.items.filter((item) => item.is_active).length}</strong><small>啟用中</small></div>
        <div><span>Coming soon</span><strong>{data.items.filter((item) => item.is_coming_soon).length}</strong><small>尚未上線</small></div>
      </section>

      <section className="bf-card bf-section-gap">
        <div className={styles.sectionHead}><div><span>Category filter</span><h2 className="bf-section-title">分類篩選</h2></div><strong>{items.length} items</strong></div>
        <div className={styles.filters}>
          <button type="button" className={selectedCategory === "ALL" ? styles.active : ""} onClick={() => setSelectedCategory("ALL")}>ALL</button>
          {data.categories.map((category) => <button type="button" key={category.category_key} className={selectedCategory === category.category_key ? styles.active : ""} onClick={() => setSelectedCategory(category.category_key)}>{category.category_key}<small>{category.category_name_zh}</small></button>)}
        </div>
      </section>

      <section className="bf-card bf-section-gap">
        <div className={styles.sectionHead}><div><span>Reference items</span><h2 className="bf-section-title">代碼列表</h2></div><strong>{selectedCategory}</strong></div>
        <div className={styles.list}>
          {items.map((item) => <article className={styles.item} key={item.id}>
            <div className={styles.itemTitle}><div><code>{item.code}</code><h3>{item.name_zh}</h3><p>{item.name_en || "—"}</p></div><span>{item.category_key}</span></div>
            <dl>
              <div><dt>Quick filter</dt><dd>{item.quick_filter_code || "—"}</dd></div>
              <div><dt>Group</dt><dd>{item.group_key || "—"}</dd></div>
              <div className={styles.description}><dt>Description</dt><dd>{item.description || "—"}</dd></div>
            </dl>
            <div className={styles.flags}><StatusFlag active={item.is_active}>active</StatusFlag><StatusFlag active={item.is_coming_soon}>coming soon</StatusFlag><StatusFlag active={item.is_deprecated}>deprecated</StatusFlag></div>
          </article>)}
        </div>
      </section>
    </>}
  </ClinicShell>;
}
