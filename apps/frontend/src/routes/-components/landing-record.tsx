export function LandingRecord() {
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-square w-[88%] max-w-md sm:w-full">
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
      <div className="absolute top-[4%] left-0 flex h-[88%] w-[76%] -rotate-6 flex-col justify-between overflow-hidden rounded-sm bg-primary p-7 text-primary-foreground shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-6 text-xs">
          <span className="font-medium">Circles</span>
          <span className="text-right opacity-70">
            Personal
            <br />
            listening archive
          </span>
        </div>
        <div className="relative py-8">
          <span className="block text-6xl leading-[0.85] font-semibold tracking-tighter sm:text-7xl">
            On
            <br />
            repeat.
          </span>
          <div className="mt-8 flex gap-2">
            <span className="size-12 rounded-full border border-current" />
            <span className="-ml-6 size-12 rounded-full border border-current" />
          </div>
        </div>
        <div className="flex items-end justify-between border-t border-current/30 pt-4 text-xs">
          <span>
            A little history.
            <br />A lot of you.
          </span>
          <span className="text-xl">↗</span>
        </div>
      </div>
    </div>
  );
}
