import { describe, expect, it } from "vitest";

import { buildPayload, emptyInput } from "./payload";

describe("buildPayload", () => {
  it("url: adds https:// when no scheme is present", () => {
    expect(buildPayload({ kind: "url", url: "  hulsambath.me/kp-trip " })).toBe(
      "https://hulsambath.me/kp-trip",
    );
  });

  it("url: keeps an existing scheme", () => {
    expect(buildPayload({ kind: "url", url: "http://localhost:3000" })).toBe(
      "http://localhost:3000",
    );
    expect(buildPayload({ kind: "url", url: "tel:+85512345678" })).toBe("tel:+85512345678");
  });

  it("url: adds https:// to host:port addresses", () => {
    expect(buildPayload({ kind: "url", url: "example.com:8080/x" })).toBe("https://example.com:8080/x");
    expect(buildPayload({ kind: "url", url: "localhost:3000" })).toBe("https://localhost:3000");
  });

  it("url: blank input encodes nothing", () => {
    expect(buildPayload({ kind: "url", url: "   " })).toBe("");
  });

  it("text: is passed through untouched (including whitespace and newlines)", () => {
    expect(buildPayload({ kind: "text", text: " line 1\nline 2 " })).toBe(" line 1\nline 2 ");
  });

  it("wifi: builds a WPA payload", () => {
    expect(
      buildPayload({ kind: "wifi", ssid: "Home", password: "secret", security: "WPA", hidden: false }),
    ).toBe("WIFI:T:WPA;S:Home;P:secret;;");
  });

  it("wifi: escapes wifi specials in ssid and password", () => {
    expect(
      buildPayload({ kind: "wifi", ssid: 'My;Net,"5G":\\', password: "a;b", security: "WPA", hidden: false }),
    ).toBe('WIFI:T:WPA;S:My\\;Net\\,\\"5G\\"\\:\\\\;P:a\\;b;;');
  });

  it("wifi: open network omits the password and marks hidden networks", () => {
    expect(
      buildPayload({ kind: "wifi", ssid: "Cafe", password: "ignored", security: "nopass", hidden: true }),
    ).toBe("WIFI:T:nopass;S:Cafe;H:true;;");
  });

  it("wifi: blank ssid encodes nothing", () => {
    expect(
      buildPayload({ kind: "wifi", ssid: "", password: "x", security: "WPA", hidden: false }),
    ).toBe("");
  });

  it("email: builds a mailto with encoded subject and body", () => {
    expect(
      buildPayload({ kind: "email", to: "me@example.com", subject: "Hi there", body: "a&b\nc" }),
    ).toBe("mailto:me@example.com?subject=Hi%20there&body=a%26b%0Ac");
  });

  it("email: omits empty query params; blank recipient encodes nothing", () => {
    expect(buildPayload({ kind: "email", to: "me@example.com", subject: "", body: "" })).toBe(
      "mailto:me@example.com",
    );
    expect(buildPayload({ kind: "email", to: " ", subject: "s", body: "" })).toBe("");
  });
});

describe("emptyInput", () => {
  it("returns a blank input of the requested kind", () => {
    expect(emptyInput("wifi")).toEqual({
      kind: "wifi",
      ssid: "",
      password: "",
      security: "WPA",
      hidden: false,
    });
    expect(buildPayload(emptyInput("url"))).toBe("");
  });
});
