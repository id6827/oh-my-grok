/**
 * Ported from oh-my-claudecode (MIT) — see NOTICE.
 * Transformed for oh-my-grok / Grok Build.
 */
declare module "safe-regex" {
  function safe(re: string | RegExp, opts?: { limit?: number }): boolean;
  export default safe;
}
