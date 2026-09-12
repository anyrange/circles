interface Artist {
  id: string;
  name: string;
  images?: { url: string; width: number; height: number }[] | null;
  playCount: number;
}

interface Props {
  artists: Artist[];
}

export function ArtistBubbleGrid({ artists }: Props) {
  if (artists.length === 0) {
    return null;
  }

  const maxPlayCount = Math.max(...artists.map((a) => a.playCount));
  const maxSize = 120;
  const minSize = 40;

  return (
    <div className="relative h-80 w-full overflow-hidden rounded-lg bg-muted/30">
      {artists.map((artist, i) => {
        const size = Math.max(minSize, Math.sqrt(artist.playCount / maxPlayCount) * maxSize);
        const img = artist.images?.[0];

        // Simple deterministic placement
        const cols = 5;
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = (col / cols) * 100 + 10;
        const y = (row / Math.ceil(artists.length / cols)) * 100 + 5;

        return (
          <div
            key={artist.id}
            className="group absolute flex items-center justify-center"
            style={{
              width: size,
              height: size,
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-background bg-muted"
              style={img ? { backgroundImage: `url(${img.url})`, backgroundSize: "cover" } : {}}
            >
              {!img && (
                <span className="text-xs font-medium text-muted-foreground">{artist.name[0]}</span>
              )}
            </div>
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 rounded bg-background px-2 py-1 text-xs shadow group-hover:block">
              <p className="font-medium">{artist.name}</p>
              <p className="text-muted-foreground">{artist.playCount} plays</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
