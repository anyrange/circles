export function LandingRecord() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto hidden aspect-square w-[75%] max-w-80 md:block md:w-full"
    >
      <svg
        viewBox="0 0 400 400"
        className="absolute top-[8%] right-[-6%] size-[84%] rotate-12 text-foreground"
      >
        <circle
          cx="200"
          cy="200"
          r="198"
          className="fill-background"
          stroke="currentColor"
          strokeOpacity="0.2"
        />
        {Array.from({ length: 18 }, (_, index) => (
          <circle
            key={index}
            cx="200"
            cy="200"
            r={90 + index * 6}
            fill="none"
            stroke="currentColor"
            strokeOpacity={index % 3 === 0 ? "0.18" : "0.07"}
          />
        ))}
        <circle cx="200" cy="200" r="76" className="fill-primary" />
        <circle cx="200" cy="200" r="8" className="fill-background" />
      </svg>
      <div className="absolute top-[4%] left-0 flex h-[88%] w-[76%] -rotate-6 flex-col justify-between overflow-hidden rounded-sm bg-primary p-6 text-primary-foreground">
        <span className="text-xs font-medium">Circles</span>
        <div className="relative py-4">
          <span className="block text-5xl leading-none font-medium tracking-tight">
            On
            <br />
            repeat.
          </span>
          <div className="mt-5 flex gap-2">
            <span className="size-8 rounded-full border border-current" />
            <span className="-ml-5 size-8 rounded-full border border-current" />
          </div>
        </div>
      </div>
    </div>
  );
}
