import { describe, expect, it } from "vitest";
import { extractPostTimestamp } from "../facebook-scraper";
import scraper3Example from "../../app/api/cron/response-examples/facebook-scraper3.json";
import scraperApi4Example from "../../app/api/cron/response-examples/facebook-scraper-api4.json";

describe("extractPostTimestamp", () => {
  it("converts facebook-scraper3 timestamps to milliseconds", () => {
    const fbPost: any = scraper3Example.posts[0];
    expect(extractPostTimestamp("facebook-scraper3", fbPost)).toBe(1770823956 * 1000);
  });

  it("parses facebook-scraper-api4 publish_time values", () => {
    const fbPost: any = scraperApi4Example.data.posts[0];
    expect(extractPostTimestamp("facebook-scraper-api4", fbPost)).toBe(
      Date.parse("2026-02-13T00:00:58Z"),
    );
  });

  it("returns null when facebook-scraper3 timestamp is missing", () => {
    const fbPost: any = {};
    expect(extractPostTimestamp("facebook-scraper3", fbPost)).toBeNull();
  });

  it("returns null for invalid facebook-scraper-api4 publish_time", () => {
    const fbPost: any = { values: { publish_time: "not-a-date" } };
    expect(extractPostTimestamp("facebook-scraper-api4", fbPost)).toBeNull();
  });
});
