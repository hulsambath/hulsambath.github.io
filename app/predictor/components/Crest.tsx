import * as React from "react";
import { initialsFor } from "../detail";

/** Team crest with an initials fallback for a missing or broken image. */
export function Crest({ src, name, size }: { src: string | null; name: string; size: number }) {
  const [broken, setBroken] = React.useState(false);
  React.useEffect(() => setBroken(false), [src]);
  const box = { width: size, height: size };
  if (!src || broken) {
    return (
      <span aria-hidden style={box}
        className="flex shrink-0 items-center justify-center rounded-full font-display text-[10px] font-bold text-muted-foreground">
        {initialsFor(name)}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={size} height={size} style={box}
    className="shrink-0 object-contain" onError={() => setBroken(true)} />;
}
