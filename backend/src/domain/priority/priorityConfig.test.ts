import { CATEGORY_IDS } from "../categories";
import { priorityConfig } from "./priorityConfig";

describe("priority config", () => {
  it("uses risk categories that exist in the domain category list", () => {
    expect(priorityConfig.riskCategoryIds).toEqual(["electronics"]);
    expect(priorityConfig.riskCategoryIds.every((category) => CATEGORY_IDS.includes(category))).toBe(true);
  });
});
