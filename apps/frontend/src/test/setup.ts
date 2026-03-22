import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { afterEach, expect } from "vite-plus/test";

expect.extend(matchers);
afterEach(cleanup);

// @ts-expect-error
global.IS_REACT_ACT_ENVIRONMENT = true;
