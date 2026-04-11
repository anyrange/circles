= Related Work

Related work falls into two areas. The first area covers software quality and fault patterns in TypeScript projects. The second area covers automated testing in continuous integration environments.

== TypeScript Quality and Fault Profiles

Bogner and Merkel compared 604 JavaScript and TypeScript projects on GitHub @bogner2022totype. They measured code quality, understandability, bug count, and bug resolution time. TypeScript projects scored better on quality and understandability. But they did not show significantly fewer bugs or faster fixes. This is relevant because it limits a common assumption. Using TypeScript improves some code properties, but it does not remove the conditions that cause bugs during testing.

Tang, Alimadadi, and Sumner analyzed 633 bug reports from 16 TypeScript repositories @tang2026toolchains. They built a taxonomy of fault categories. The main finding is that tooling and configuration faults are more common than logic or syntax errors. Many failures appear at integration and orchestration boundaries. This directly supports the premise of this paper. In TypeScript projects, fragility often lives in the surrounding toolchain rather than in the application code.

Both studies are useful but stop short of the research question here. Bogner and Merkel compare repositories at a population level. Tang et al. describe fault patterns across the ecosystem. Neither paper asks whether sharing one resolver and one test runner across packages changes consistency inside a single monorepo.

== Continuous Integration and Automated Testing

Wang et al. studied test automation maturity in CI environments @wang2022testautomation. Higher maturity correlated with better product quality and shorter release cycles. Reliable test infrastructure matters. But the unit of analysis is the project as a whole, not differences between packages inside one repository.

Yu et al. examined automated non-functional testing in CI through an industry study @yu2023nfrci. They describe CI as a system of tools, metrics, and feedback mechanisms. Test behavior depends on the surrounding infrastructure, not only on the test cases. This supports the framing of the current paper. But that study focuses on NFR evaluation, not on per-package differences in test stack configuration.

The reviewed literature shows three things. TypeScript improves code quality indicators but does not eliminate bug-related problems @bogner2022totype. Failures in TypeScript projects often cluster around configuration and tooling boundaries @tang2026toolchains. Testing outcomes depend on automation infrastructure @wang2022testautomation; @yu2023nfrci. What is missing is a study of how toolchain unification affects test consistency across packages in a single monorepo. That gap motivates this case study.
