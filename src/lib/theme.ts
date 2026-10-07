// Server-safe: the root layout imports the script below, so nothing in this
// file may touch React hooks or the DOM. The hook and the setter live with
// the other client hooks in hooks.ts.

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "apm-theme";

/** What a visitor gets until they use the switch. The layout renders it on <html>. */
export const DEFAULT_THEME: Theme = "light";

/**
 * Inlined in <head> so a saved choice that differs from the default is on
 * <html> before first paint and never flashes the wrong theme. Only the
 * non-default theme needs setting, since the server already rendered the
 * default.
 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;
