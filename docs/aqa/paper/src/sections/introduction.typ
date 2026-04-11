= Introduction

TypeScript monorepos put frontend, backend, and shared packages in one repository. This makes code sharing easier. But it also makes the toolchain more complex. Different packages can end up using different test runners, module resolvers, and build transforms. When that happens, the same test logic can pass in one package and fail in another. The code is not wrong. The environment is different.

This problem is common in full-stack repositories. Packages are not truly isolated. They share types, utility modules, and build assumptions. When each package has its own testing setup, small differences in configuration can produce different results. This is called toolchain fragmentation. It is an environment problem, not a logic problem.

This paper studies that problem through Circles, a TypeScript full-stack monorepo. Circles uses a unified toolchain called Vite+ that gives all packages one command interface and one core testing stack. The study examines whether this unification produces consistent test behavior across packages. It combines repository inspection, CI workflow review, and direct test execution. Three research questions guide the analysis:

/ RQ1: How does per-package toolchain fragmentation create inconsistent test behavior in a TypeScript monorepo?
/ RQ2: Does a unified toolchain reduce the number of configuration files needed to run tests across packages?
/ RQ3: Does sharing one command interface and one transform pipeline produce more uniform test results in Circles?

The paper makes three contributions. First, it defines toolchain fragmentation as an environment-level cause of test inconsistency. Second, it documents the Circles testing setup using observable repository evidence. Third, it evaluates unification using configuration surface size, execution outcomes, coverage scope, and CI pipeline structure.
