"use client";
import { useState } from "react";
import { milestones } from "@/lib/milestones";
export default function ProgressArchive() {
  const [category, setCategory] = useState("All records");
  const items = milestones.filter(item => category === "All records" || item.category === category);
  return <><label className="progress-filter">Filter the record<select value={category} onChange={event => setCategory(event.target.value)}>{["All records", ...milestones.map(item => item.category)].map(item => <option key={item}>{item}</option>)}</select></label><p className="scope-caption" role="status">{items.length} records · event dates awaiting confirmation</p><ol className="progress-archive">{items.map(item => <li key={item.id} id={`record-${item.id}`}><span className="archive-date">Date unconfirmed</span><details><summary><span className="eyebrow">{item.category}</span><h3>{item.title}</h3><span>{item.result}</span></summary><p>{item.copy}</p><p className="scope-caption">{item.id === "changenow" || item.id === "agriculture" ? "Selection notice supplied by Huner. Selection is not a claim of winning the final event." : "Reported in materials supplied by Huner. The original award or program record is awaiting public-source review."}</p><p className="scope-caption">A confirmed event date and shareable evidence are needed before placing this item on a chronological timeline.</p></details></li>)}</ol></>;
}
