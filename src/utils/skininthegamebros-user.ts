/**
 * Ported from oh-my-claudecode (MIT) — see NOTICE.
 * Transformed for oh-my-grok / Grok Build.
 */
export function isSkininthegamebrosUser(): boolean {
  return process.env.USER_TYPE === 'ant';
}

