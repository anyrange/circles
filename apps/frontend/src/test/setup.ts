import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vite-plus/test";

expect.extend(matchers);

// @ts-expect-error
global.IS_REACT_ACT_ENVIRONMENT = true;
