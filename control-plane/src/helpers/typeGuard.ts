type Guard<T> = (value: any) => value is T;

export function createGuard<T>(check: (value: any) => boolean): Guard<T> {
  return (value: any): value is T => {
    return typeof value === 'object' && value !== null && check(value);
  };
}

export function isStringArray(val: any): val is string[] {
  return Array.isArray(val) && val.every((item) => typeof item === 'string');
}

export function isPartialObject(value: any, shape: Record<string, (v: any) => boolean>): boolean {
  if (typeof value !== 'object' || value === null) return false;
  for (const key in shape) {
    if (key in value && !shape[key](value[key])) {
      return false;
    }
  }
  return true;
}

export function isExactObject<T>(obj: unknown, shape: { [K in keyof T]: (value: unknown) => boolean }): obj is T {
  if (typeof obj !== 'object' || obj === null) return false;

  const keys = Object.keys(shape);
  return keys.every((key) => key in obj && shape[key as keyof T]((obj as any)[key]));
}
