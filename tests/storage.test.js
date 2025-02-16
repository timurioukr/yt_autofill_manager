import { describe, it, expect, beforeEach } from "vitest";
import { loadSlots, saveSlots, STORAGE_KEY } from "../src/storage.js";

describe("Storage functions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("повинен повертати пустий масив, якщо немає даних", () => {
    const slots = loadSlots();
    expect(slots).toEqual([]);
  });

  it("повинен зберігати та завантажувати слоти", () => {
    const testSlots = [
      {
        url: "example.com",
        fields: [{ fieldId: "input1", fieldValue: "test" }],
      },
    ];
    saveSlots(testSlots);
    const loaded = loadSlots();
    expect(loaded).toEqual(testSlots);
  });
});
