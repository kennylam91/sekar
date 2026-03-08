import { describe, expect, it } from "vitest";
import { normalizeRoutesArray, parseRoutesString } from "@/lib/routes";

describe("normalizeRoutesArray", () => {
  it("normalizes, deduplicates and uppercases values", () => {
    const result = normalizeRoutesArray([
      " hn-qn ",
      "HN-QN",
      "hn-hp-qn",
      "",
      null,
    ]);

    expect(result).toEqual(["HN-QN", "HN-HP-QN"]);
  });

  it("returns empty for non-array values", () => {
    expect(normalizeRoutesArray("HN-QN")).toEqual([]);
    expect(normalizeRoutesArray(undefined)).toEqual([]);
  });
});

describe("parseRoutesString", () => {
  it("parses comma and newline separated values", () => {
    const result = parseRoutesString("hn-qn, hn-hp-qn\nqn-hn");
    expect(result).toEqual(["HN-QN", "HN-HP-QN", "QN-HN"]);
  });
});
