import { describe, expect, test } from "vitest";
import { leadSource, sourceFields, type Channel } from "@/lib/lead-source";

const request = (headers: Record<string, string> = {}) =>
  new Request("https://scribebunny.com/api/leads", {
    method: "POST",
    headers,
  });

const visit = (touch: Record<string, unknown>) => ({
  last: { at: "2026-11-16T10:00:00.000Z", landing: "/", ...touch },
});

describe("channel", () => {
  test.each<[string, Record<string, unknown>, Channel, string]>([
    [
      "Google Ads click",
      { click: "gclid", referrer: "www.google.com" },
      "Paid search",
      "google.com",
    ],
    [
      "tagged Google Ads",
      { utm: { source: "Google", medium: "cpc" } },
      "Paid search",
      "google",
    ],
    ["Bing Ads click", { click: "msclkid" }, "Paid search", "bing"],
    [
      "Google search",
      { referrer: "www.google.co.uk" },
      "Organic search",
      "google.co.uk",
    ],
    [
      "Google app",
      { referrer: "com.google.android.googlequicksearchbox" },
      "Organic search",
      "com.google.android.googlequicksearchbox",
    ],
    [
      "DuckDuckGo",
      { referrer: "duckduckgo.com" },
      "Organic search",
      "duckduckgo.com",
    ],
    [
      "ChatGPT tag",
      { utm: { source: "chatgpt.com" } },
      "AI assistant",
      "chatgpt.com",
    ],
    [
      "Gemini, not Google search",
      { referrer: "gemini.google.com" },
      "AI assistant",
      "gemini.google.com",
    ],
    [
      "Perplexity",
      { referrer: "www.perplexity.ai" },
      "AI assistant",
      "perplexity.ai",
    ],
    [
      "LinkedIn post",
      { referrer: "www.linkedin.com" },
      "Organic social",
      "linkedin.com",
    ],
    [
      "LinkedIn short link",
      { referrer: "lnkd.in" },
      "Organic social",
      "lnkd.in",
    ],
    ["X short link", { referrer: "t.co" }, "Organic social", "t.co"],
    [
      "Facebook link",
      { click: "fbclid", referrer: "l.facebook.com" },
      "Organic social",
      "l.facebook.com",
    ],
    [
      "Facebook ad",
      { click: "fbclid", utm: { source: "facebook", medium: "paid_social" } },
      "Paid social",
      "facebook",
    ],
    [
      "LinkedIn ad",
      { utm: { source: "linkedin", medium: "cpc" } },
      "Paid social",
      "linkedin",
    ],
    ["TikTok ad click", { click: "ttclid" }, "Paid social", "tiktok"],
    [
      "display ad",
      { utm: { source: "adroll", medium: "display" } },
      "Paid other",
      "adroll",
    ],
    [
      "outreach email",
      { utm: { source: "explee", medium: "email" } },
      "Email",
      "explee",
    ],
    [
      "Gmail on the web",
      { referrer: "mail.google.com" },
      "Email",
      "mail.google.com",
    ],
    [
      "Outlook on the web",
      { referrer: "outlook.live.com" },
      "Email",
      "outlook.live.com",
    ],
    ["directory listing", { referrer: "clutch.co" }, "Referral", "clutch.co"],
    [
      "partner tag",
      { utm: { source: "partner-x" } },
      "Other campaign",
      "partner-x",
    ],
    ["typed address", {}, "Direct", "(direct)"],
  ])("%s", (_name, touch, channel, source) => {
    const result = leadSource(request(), visit(touch));
    expect(result.channel).toBe(channel);
    expect(result.source).toBe(source);
  });

  test("a form sent without browser data is Unknown", () => {
    expect(leadSource(request(), undefined)).toMatchObject({
      channel: "Unknown",
      source: "(not recorded)",
    });
  });
});

describe("input from the browser", () => {
  test("drops values that are not paths, hosts or dates", () => {
    const result = leadSource(request(), {
      last: {
        at: "not a date",
        landing: "https://evil.example/x",
        referrer: "<script>",
        utm: { source: 5 },
        click: "made_up_id",
      },
      page: "//evil.example",
    });
    expect(result).toMatchObject({ channel: "Direct", source: "(direct)" });
    expect(result.landing).toBeUndefined();
    expect(result.page).toBeUndefined();
  });

  test("keeps only the path of the landing page", () => {
    const result = leadSource(
      request(),
      visit({ landing: "/pricing?session_id=secret#top" }),
    );
    expect(result.landing).toBe("/pricing");
  });

  test("caps long tag values", () => {
    const result = leadSource(
      request(),
      visit({ utm: { campaign: "x".repeat(500) } }),
    );
    expect(result.campaign).toHaveLength(150);
  });
});

describe("first visit", () => {
  const first = {
    at: "2026-11-01T10:00:00.000Z",
    landing: "/blog/post",
    referrer: "www.google.com",
  };

  test("is kept when it came from somewhere else", () => {
    const result = leadSource(request(), {
      first,
      ...visit({ utm: { source: "linkedin", medium: "cpc" } }),
    });
    expect(result.first).toEqual({
      channel: "Organic search",
      source: "google.com",
      landing: "/blog/post",
      at: first.at,
    });
  });

  test("is left out when it is the same visit", () => {
    const touch = {
      at: first.at,
      landing: first.landing,
      referrer: first.referrer,
    };
    expect(
      leadSource(request(), { first: touch, last: touch }).first,
    ).toBeUndefined();
  });
});

describe("location and device", () => {
  test("reads Vercel's geo headers and the user agent", () => {
    const result = leadSource(
      request({
        "x-vercel-ip-city": "S%C3%A3o%20Paulo",
        "x-vercel-ip-country-region": "SP",
        "x-vercel-ip-country": "BR",
        "user-agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148",
      }),
      visit({}),
    );
    expect(result).toMatchObject({
      city: "São Paulo",
      region: "SP",
      country: "Brazil",
      device: "Mobile",
    });
  });

  test.each([
    ["Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36", "Tablet"],
    ["Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari/537.36", "Mobile"],
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15",
      "Desktop",
    ],
  ])("%s is %s", (userAgent, device) => {
    expect(
      leadSource(request({ "user-agent": userAgent }), visit({})).device,
    ).toBe(device);
  });
});

describe("alert rows", () => {
  test("show the channel, campaign, pages, first visit and place", () => {
    const source = leadSource(
      request({
        "x-vercel-ip-city": "Phoenix",
        "x-vercel-ip-country-region": "AZ",
        "x-vercel-ip-country": "US",
      }),
      {
        first: {
          at: "2026-11-01T18:00:00.000Z",
          landing: "/",
          referrer: "www.google.com",
        },
        last: {
          at: "2026-11-16T10:00:00.000Z",
          landing: "/pricing",
          utm: {
            source: "linkedin",
            medium: "cpc",
            campaign: "Q4",
            term: "explainer",
            content: "ad-2",
          },
        },
        page: "/contact",
      },
    );
    expect(Object.fromEntries(sourceFields(source))).toMatchObject({
      Channel: "Paid social · linkedin / cpc",
      Campaign: "Q4 · keyword: explainer · ad: ad-2",
      "Landing page": "/pricing",
      "Form page": "/contact",
      "First visit": "Organic search · google.com · Nov 1, 2026 · landed on /",
      Location: "Phoenix, AZ, United States",
    });
  });

  test("a direct visit shows the channel alone", () => {
    expect(sourceFields(leadSource(request(), visit({})))[0]).toEqual([
      "Channel",
      "Direct",
    ]);
  });

  test("nothing recorded gives no rows", () => {
    expect(sourceFields(undefined)).toEqual([]);
  });
});
