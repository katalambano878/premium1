/** Public base URL of the site, without a trailing slash. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
}
