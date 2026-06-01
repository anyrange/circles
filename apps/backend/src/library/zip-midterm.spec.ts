import { describe, expect, test } from "vite-plus/test";

import { isZip } from "./zip";

describe("TC-ZIP-EDGE-01 — isZip with exactly 2-byte PK array", () => {
  test("returns true for minimal valid PK signature (2 bytes)", () => {
    expect(isZip(new Uint8Array([0x50, 0x4b]))).toBe(true);
  });
});

describe("TC-ZIP-EDGE-02 — isZip with 1-byte array", () => {
  test("returns false when only one byte is present (bytes[1] is undefined)", () => {
    expect(isZip(new Uint8Array([0x50]))).toBe(false);
  });
});

describe("TC-ZIP-EDGE-03 — isZip with large array starting with PK", () => {
  test("returns true for a larger array whose first two bytes are PK", () => {
    const buf = new Uint8Array(1024);
    buf[0] = 0x50;
    buf[1] = 0x4b;
    expect(isZip(buf)).toBe(true);
  });
});
