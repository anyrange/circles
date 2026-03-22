import { type TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "vite-plus/test" {
  interface Assertion<T = any> extends TestingLibraryMatchers<any, T> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any> {}
}
