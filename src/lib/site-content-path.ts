type PathSegment = string | number;

function parsePath(path: string): PathSegment[] {
  return path.split(".").map((segment) => {
    const index = Number(segment);
    return Number.isInteger(index) && String(index) === segment ? index : segment;
  });
}

export function getValueAtPath(root: unknown, path: string): unknown {
  const segments = parsePath(path);
  let current: unknown = root;

  for (const segment of segments) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string | number, unknown>)[segment];
  }

  return current;
}

export function setValueAtPath(root: unknown, path: string, value: unknown): unknown {
  const segments = parsePath(path);
  if (segments.length === 0) return value;

  const clone = structuredClone(root) as Record<string | number, unknown>;
  let current: Record<string | number, unknown> = clone;

  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i];
    const next = current[segment];

    if (next == null || typeof next !== "object") {
      const nextSegment = segments[i + 1];
      current[segment] = typeof nextSegment === "number" ? [] : {};
    } else if (Array.isArray(next)) {
      current[segment] = [...next];
    } else {
      current[segment] = { ...(next as Record<string | number, unknown>) };
    }

    current = current[segment] as Record<string | number, unknown>;
  }

  current[segments[segments.length - 1]] = value;
  return clone;
}
