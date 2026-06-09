export const CATEGORY_IDS = ["electronics", "office", "supplies", "home"] as const;

export type CategoryId = typeof CATEGORY_IDS[number];

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  electronics: "Electrónica",
  office: "Oficina",
  supplies: "Insumos",
  home: "Hogar"
};

export function categoryLabel(category: CategoryId): string {
  return CATEGORY_LABELS[category] ?? category;
}
