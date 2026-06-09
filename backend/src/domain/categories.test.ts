import { CATEGORY_IDS } from "./categories";
import { createSeedData } from "../data/seedData";

describe("categories", () => {
  it("covers every category used by the seed order snapshots", () => {
    const seed = createSeedData();
    const usedCategories = new Set([
      ...seed.orders.flatMap((order) => order.items.map((item) => item.category))
    ]);

    expect(new Set(CATEGORY_IDS)).toEqual(usedCategories);
  });
});
