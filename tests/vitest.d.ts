declare module "vitest" {
  export const describe: {
    (name: string, fn: () => void): void;
    each<T extends readonly unknown[] | Record<string, unknown>>(cases: readonly T[]): (name: string, fn: (item: T) => void) => void;
  };
  export const it: {
    (name: string, fn: () => void): void;
    each<T>(cases: readonly T[]): (name: string, fn: (item: T) => void) => void;
  };
  export function expect(actual: unknown): {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
  };
}
