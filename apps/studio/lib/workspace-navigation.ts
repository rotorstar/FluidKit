import { unprefixedPath } from './locale-routing';
import { readWorkspaceLocation, workspaceSearch, type WorkspaceData } from '@fluidkit/cases';
import type { FluidRuntime } from '@fluidkit/core';

const storageKey = 'fluid.workspace.return.v1';
export function workspaceReturnHref() {
  try {
    const query = sessionStorage.getItem(storageKey);
    return query?.startsWith('?view=') ? '/' + query : '/';
  } catch { return '/'; }
}

/** Only the case codec can put values in the return link. Drafts and search text stay private. */
export function connectWorkspaceHistory(runtime: FluidRuntime, data: WorkspaceData, report: (message: string) => void) {
  let restoring = false;
  let currentRoute = '';
  const remember = (query: string) => { try { sessionStorage.setItem(storageKey, query); } catch { /* explicit URLs still work without tab storage */ } };
  function restore() {
    restoring = true;
    try {
      let search = window.location.search;
      if (!search && document.referrer) {
        const referrer = new URL(document.referrer);
        if (referrer.origin === location.origin && unprefixedPath(referrer.pathname).startsWith('/studio')) search = workspaceReturnHref().slice(1);
      }
      const result = runtime.send('navigation.restore', readWorkspaceLocation(search, data), 'host');
      if (!result.accepted) throw new Error(result.reason);
      const canonical = workspaceSearch(result.snapshot);
      currentRoute = canonical;
      remember(canonical);
      if (search && canonical !== window.location.search) history.replaceState(history.state, '', location.pathname + canonical + location.hash);
      report('');
    } catch (error) { report(error instanceof Error ? error.message : 'Ungültiger Workspace-Link'); }
    finally { restoring = false; }
  }
  restore();
  const unsubscribe = runtime.subscribe(() => {
    if (restoring) return;
    const next = workspaceSearch(runtime.getSnapshot());
    if (next === currentRoute) return;
    currentRoute = next;
    remember(next);
    if (location.search === next) return;
    const before = new URLSearchParams(location.search), after = new URLSearchParams(next);
    before.delete('picked');
    after.delete('picked');
    const url = location.pathname + next + location.hash;
    if (before.toString() === after.toString()) history.replaceState(history.state, '', url);
    else history.pushState(null, '', url);
  });
  window.addEventListener('popstate', restore);
  return () => { unsubscribe(); window.removeEventListener('popstate', restore); };
}
