const ROUTE_SPLIT_REGEX = /[\n,]+/;

const normalizeRouteToken = (value: unknown | null | undefined) => {
  if (value === null || value === undefined) return "";
  return String(value).trim().toUpperCase();
};

export function normalizeRoutesArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const candidate of input) {
    const token = normalizeRouteToken(candidate);
    if (!token || seen.has(token)) continue;
    seen.add(token);
    normalized.push(token);
  }

  return normalized;
}

export function parseRoutesString(value: string): string[] {
  return normalizeRoutesArray(
    value
      .split(ROUTE_SPLIT_REGEX)
      .map((segment) => segment.trim())
      .filter(Boolean),
  );
}
