#import "@preview/simple-research-poster:0.2.0": *
#import "colors.typ": (
  base-colors,
  bold-color,
)
#import "sections.typ": *

#set page(
  paper: "a1",
  flipped: true,
  margin: 0%,
)

#show: poster.with(
  title: text(size: 54pt, weight: "extrabold")[
    Risk-Based Automated QA for a TypeScript Full-Stack Monorepo
  ],
  author: text(size: 29pt)[
    Aldiyar Seylkhanov, Alexandr Tyulkov, Malika Ishakhanova
  ],
  subtitle: text(size: 23pt)[
    Astana IT University | Software QA and Testing | Circles case study
  ],
  logo: image("aitu-logo__2-350x174.png", height: 50%),
  base-colors: base-colors,
)

#let colored-poster-section = poster-section.with(
  base-colors: base-colors,
  title-style: text.with(
    size: 31pt,
    weight: "extrabold",
    fill: base-colors.bgcolor2,
  ),
)

#set text(
  size: 18pt,
  font: "Arial",
)
#set par(justify: true, leading: 0.58em)
#show strong: set text(fill: bold-color)

#pad(
  grid(
    columns: 3,
    inset: 28pt,
    gutter: 27pt,
    [
      #colored-poster-section[Introduction][#problem]
      #colored-poster-section(fill: true)[Literature Evidence][#literature]
      #colored-poster-section[Research Question][#research-question]
    ],
    [
      #colored-poster-section(fill: true)[Methodology: Risk Model][#risk-model]
      #colored-poster-section[Methodology: QA Pipeline][#qa-pipeline]
      #colored-poster-section(fill: true)[Results][#metrics]
    ],
    [
      #colored-poster-section[Discussion: Key Findings][#findings]
      #colored-poster-section(fill: true)[Conclusion][#recommendations]
      #colored-poster-section[Limitations][#limitations]
      #colored-poster-section(fill: true)[References and Evidence][#references]
    ],
  ),
  top: 22pt,
  x: 56pt,
)
