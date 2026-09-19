export const chapters = ["arrival", "life", "conditions", "foundry", "cultivation", "material", "applications", "food", "fragrance", "raw-materials", "milestones", "team", "possibility"] as const;
export const clamp = (value: number) => Math.max(0, Math.min(1, value));
export function materialWindow(scroll: number, top: number, height: number, viewport: number) {
  const end = top + height;
  const active = scroll >= top && scroll < end;
  const progress = active ? clamp((scroll - top) / Math.max(1, height - viewport)) : 0;
  // Camera travel provides the exit. The living canvas never blanks between chapters.
  const opacity = 1, offset = 0;
  return { active, progress, opacity, offset };
}
export function contactIsTap(distance: number, duration: number) {
  return distance < 12 && duration < 600;
}
