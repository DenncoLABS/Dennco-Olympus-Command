export type CoreDeskView = 'core' | 'apps' | 'files' | 'architecture' | 'terminal' | 'ollama' | 'packages' | 'settings';

export const coreDeskViews: CoreDeskView[] = ['core', 'apps', 'files', 'architecture', 'terminal', 'ollama', 'packages', 'settings'];

export function getCoreDeskViews(): CoreDeskView[] {
  return [...coreDeskViews];
}

export function isCoreDeskView(view: string): view is CoreDeskView {
  return getCoreDeskViews().includes(view as CoreDeskView);
}

export function getCoreDeskViewOrFallback(view: string | null | undefined, fallback: CoreDeskView = 'core'): CoreDeskView {
  return view && isCoreDeskView(view) ? view : fallback;
}
