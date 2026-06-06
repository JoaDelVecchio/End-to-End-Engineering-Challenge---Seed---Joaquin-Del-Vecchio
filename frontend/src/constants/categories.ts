const CATEGORY_LABELS: Record<string, string> = {
  electronics: "Electrónica",
  office: "Oficina",
  supplies: "Insumos",
  home: "Hogar"
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}
