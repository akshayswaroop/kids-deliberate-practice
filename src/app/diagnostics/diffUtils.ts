export type DiffEntry = {
  path: string;
  before: unknown;
  after: unknown;
};

const isObject = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

export function computeDiff(before: unknown, after: unknown, basePath = ''): DiffEntry[] {
  if (before === after) {
    return [];
  }

  if (!isObject(before) || !isObject(after)) {
    return [
      {
        path: basePath || '(root)',
        before,
        after,
      },
    ];
  }

  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const diffs: DiffEntry[] = [];

  keys.forEach(key => {
    const nextPath = basePath ? `${basePath}.${key}` : key;
    const beforeValue = (before as Record<string, unknown>)[key];
    const afterValue = (after as Record<string, unknown>)[key];

    if (Array.isArray(beforeValue) || Array.isArray(afterValue)) {
      if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
        diffs.push({ path: nextPath, before: beforeValue, after: afterValue });
      }
      return;
    }

    if (isObject(beforeValue) && isObject(afterValue)) {
      diffs.push(...computeDiff(beforeValue, afterValue, nextPath));
      return;
    }

    if (beforeValue !== afterValue) {
      diffs.push({ path: nextPath, before: beforeValue, after: afterValue });
    }
  });

  return diffs;
}
