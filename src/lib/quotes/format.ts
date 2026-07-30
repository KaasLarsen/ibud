export function formatDkk(amount: number): string {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatStorage(gb: number): string {
  if (gb >= 1024) return `${gb / 1024} TB`;
  return `${gb} GB`;
}

export function formatFetchedAt(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return "opdateret nu";
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "opdateret nu";
  if (mins < 60) return `opdateret ${mins} min siden`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `opdateret ${hours} t siden`;
  return `opdateret ${new Date(iso).toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
  })}`;
}

export function pickWinner<T extends { amountDkk: number | null }>(
  quotes: T[],
): T | null {
  const withAmount = quotes.filter(
    (q): q is T & { amountDkk: number } =>
      typeof q.amountDkk === "number" && q.amountDkk > 0,
  );
  if (withAmount.length === 0) return null;
  return withAmount.reduce((best, q) =>
    q.amountDkk > best.amountDkk ? q : best,
  );
}
