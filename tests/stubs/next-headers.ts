// Stand-in for next/headers: one cookie jar shared by the test file, so a
// route that signs someone in can be followed by code that reads the session.
type Cookie = { name: string; value: string; options?: Record<string, unknown> };
const jar = new Map<string, Cookie>();

export const testCookies = {
  jar,
  clear: () => jar.clear(),
  get: (name: string) => jar.get(name)?.value,
};

export async function cookies() {
  return {
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)!.value } : undefined),
    set: (name: string, value: string, options?: Record<string, unknown>) => {
      if (options?.maxAge === 0 || value === "") jar.delete(name);
      else jar.set(name, { name, value, options });
    },
    delete: (name: string) => jar.delete(name),
  };
}

export async function headers() {
  return new Headers();
}
