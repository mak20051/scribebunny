import { describe, expect, test } from "vitest";
import {
  alertText,
  brandedEmail,
  detailsTable,
  escapeHtml,
} from "@/lib/email-layout";

const attack = `<img src=x onerror="alert('x')">&`;

describe("email layout", () => {
  test("escapes HTML", () => {
    expect(escapeHtml(attack)).toBe(
      "&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;",
    );
  });

  test("details tables escape labels and values and skip empty rows", () => {
    const html = detailsTable([
      ["Name", attack],
      [attack, "value"],
      ["Phone", undefined],
      ["Website", "   "],
    ]);
    expect(html).not.toContain("<img");
    expect(html).not.toContain("Phone");
    expect(html).not.toContain("Website");
  });

  test("only http(s) addresses and emails become links", () => {
    expect(detailsTable([["Link", "https://example.com/a?b=1&c=2"]])).toContain(
      'href="https://example.com/a?b=1&amp;c=2"',
    );
    expect(detailsTable([["Email", "a@example.com"]])).toContain(
      'href="mailto:a@example.com"',
    );
    expect(detailsTable([["Link", "javascript:alert(1)"]])).not.toContain(
      "href=",
    );
  });

  test("plain-text alerts skip empty rows", () => {
    expect(
      alertText("New lead", [
        ["Name", "Ada"],
        ["Phone", undefined],
        ["Website", " "],
      ]),
    ).toBe("New lead\n\nName: Ada");
  });

  test("branded emails escape the button and show the stop link", () => {
    const html = brandedEmail({
      heading: "Hi",
      bodyHtml: "<p>Body</p>",
      button: { label: attack, href: "https://scribebunny.com/?a=1&b=2" },
      stopLink: {
        reason: "You asked for concepts.",
        href: "https://scribebunny.com/stop-reminders?id=C-1&k=2",
      },
    });
    expect(html).not.toContain(attack);
    expect(html).toContain(escapeHtml(attack));
    expect(html).toContain('href="https://scribebunny.com/?a=1&amp;b=2"');
    expect(html).toContain("You asked for concepts.");
    expect(html).toContain("stop-reminders?id=C-1&amp;k=2");
  });
});
