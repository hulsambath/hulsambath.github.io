import { describe, expect, it } from "vitest";

import { canCopyImage, dataUrlToBlob, qrFilename } from "./download";

describe("qrFilename", () => {
  it("slugs the url host and path", () => {
    expect(qrFilename({ kind: "url", url: "https://hulsambath.me/kp-trip?x=1" }, "png")).toBe(
      "qr-hulsambath-me-kp-trip.png",
    );
  });

  it("slugs host:port urls", () => {
    expect(qrFilename({ kind: "url", url: "example.com:8080/x" }, "png")).toBe("qr-example-com-x.png");
  });

  it("uses the ssid for wifi and a generic name otherwise", () => {
    expect(
      qrFilename({ kind: "wifi", ssid: "Home 5G", password: "", security: "WPA", hidden: false }, "svg"),
    ).toBe("qr-wifi-home-5g.svg");
    expect(qrFilename({ kind: "text", text: "សួស្តី" }, "png")).toBe("qr-text.png");
  });

  it("falls back when the slug would be empty", () => {
    expect(qrFilename({ kind: "url", url: "" }, "png")).toBe("qr-url.png");
  });
});

describe("dataUrlToBlob", () => {
  it("decodes a base64 data URL without fetch", async () => {
    const blob = dataUrlToBlob("data:image/png;base64,aGVsbG8=");
    expect(blob.type).toBe("image/png");
    expect(await blob.text()).toBe("hello");
  });

  it("throws on non-base64 data URLs", () => {
    expect(() => dataUrlToBlob("data:text/plain,hello")).toThrow();
  });
});

describe("canCopyImage", () => {
  it("is false outside a browser", () => {
    expect(canCopyImage()).toBe(false);
  });
});
