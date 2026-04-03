= System Description

// TODO: describe Circles and Vite+
// 3.1 Circles monorepo architecture
//     - packages: frontend (React), backend (Hono + Drizzle), shared
//     - explain the role of each package briefly
// 3.2 The fragmented baseline (what a typical setup looks like before Vite+)
//     - separate Jest/Vitest configs per package
//     - different transform pipelines (ts-jest, babel-jest, esbuild-jest)
//     - module resolution differences
// 3.3 Vite+ unified toolchain
//     - one CLI (`vp`), one resolver, one transform pipeline (Rolldown/Oxlint/Vitest)
//     - how `vp test` works across packages
//     - configuration surface: what is shared vs overridable
