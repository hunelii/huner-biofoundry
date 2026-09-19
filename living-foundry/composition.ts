type Point = { x: number; y: number };
const smooth = (a: number, b: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** One transform serves the displayed field, environmental input and cell origin. */
export function fieldView(stage: number, phone: boolean) {
  const conditions = smooth(1.1, 1.85, stage) * (1 - smooth(2.15, 3, stage));
  const base = phone ? 1 : 1 + Math.max(0, Math.min(1, stage / 2)) * .6;
  return {
    conditions,
    scale: base + ((phone ? 1.8 : 2.65) - base) * conditions,
    center: { x: .698 + (.46 - .698) * conditions, y: .61 + ((phone ? .48 : .52) - .61) * conditions },
    verticalOffset: phone ? .16 : 0,
  };
}
export type FieldView = ReturnType<typeof fieldView>;
export function screenToField(point: Point, view: FieldView): Point {
  return { x: .698 + (point.x - view.center.x) / view.scale, y: .61 + (point.y - view.center.y - view.verticalOffset) / view.scale };
}
export function fieldToScreen(point: Point, view: FieldView): Point {
  return { x: view.center.x + (point.x - .698) * view.scale, y: view.center.y + (point.y - .61) * view.scale + view.verticalOffset };
}
