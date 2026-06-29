export type CoreDeskView = 'core' | 'apps' | 'files' | 'architecture' | 'terminal' | 'ollama' | 'packages' | 'settings';

const coreDeskViews: CoreDeskView[] = ['core', 'apps', 'files', 'architecture', 'terminal', 'ollama', 'packages', 'settings'];

export function isCoreDeskView(view: string): view is CoreDeskView {
  return coreDeskViews.includes(view as CoreDeskView);
}
