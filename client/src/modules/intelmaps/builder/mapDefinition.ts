import type { IntelSavedMapDefinition } from '../registry/types';

export function createMapDefinition(input: Partial<IntelSavedMapDefinition> & { title: string }): IntelSavedMapDefinition {
  const now = new Date().toISOString();
  const id = input.id || input.title.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || `map-${Date.now()}`;
  return {
    id,
    title: input.title,
    appId: input.appId || 'custom',
    baseLayer: input.baseLayer || 'dark',
    projection: input.projection || 'mercator',
    layerIds: input.layerIds || [],
    feedIds: input.feedIds || [],
    widgetIds: input.widgetIds || [],
    workflowIds: input.workflowIds || [],
    viewport: input.viewport,
    notes: input.notes || '',
    createdAt: input.createdAt || now,
    updatedAt: now,
  };
}
