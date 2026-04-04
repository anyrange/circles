import { expect, test } from "vite-plus/test";

import { isZip } from "./zip";

test("returns true for PK magic bytes", () => {
  const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
  expect(isZip(bytes)).toBe(true);
});

test("returns false for non-zip bytes", () => {
  expect(isZip(new Uint8Array([0x7b, 0x22]))).toBe(false); // JSON {
  expect(isZip(new Uint8Array([0xff, 0xfe]))).toBe(false);
  expect(isZip(new Uint8Array([0x50, 0x00]))).toBe(false); // P but not PK
});

test("returns false for empty array", () => {
  expect(isZip(new Uint8Array([]))).toBe(false);
});
