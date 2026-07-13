import { countryFlag } from "../board";

export function CountryFlag({ country, name }: { country: string | null; name: string }) {
  const flag = countryFlag(country);
  if (flag) return <span aria-hidden className="text-lg leading-none">{flag}</span>;
  const initials = name.replace(/[^A-Za-z ]/g, "").split(" ")
    .filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  return (
    <span aria-hidden
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-secondary font-display text-[9px] font-bold text-muted-foreground">
      {initials || "?"}
    </span>
  );
}
