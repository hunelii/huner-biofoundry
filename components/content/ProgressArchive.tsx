"use client";
import { useState } from "react";
import { milestones } from "@/lib/milestones";
export default function ProgressArchive() {
  const [category, setCategory] = useState("All records");
  const categories = ["All records", ...Array.from(new Set(milestones.map(item => item.category)))];
  const items = milestones.filter(item => category === "All records" || item.category === category);
  return (
    <>
      <label className="progress-filter">Filter the record
        <select value={category} onChange={event => setCategory(event.target.value)}>
          {categories.map(item => <option key={item}>{item}</option>)}
        </select>
      </label>
      <p className="scope-caption" role="status">{items.length} milestone records · incubation and R&D recognition</p>
      <ol className="progress-archive">
        {items.map(item => (
          <li key={item.id} id={`record-${item.id}`}>
            <span className="archive-date">{item.date}</span>
            <details open>
              <summary>
                <span className="eyebrow">{item.category}</span>
                <h3>{item.title}</h3>
                <span>{item.result}</span>
              </summary>
              <p>{item.copy}</p>
            </details>
          </li>
        ))}
      </ol>
    </>
  );
}
