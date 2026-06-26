import type { IntelWorkflowDefinition } from '../registry/types';

export const intelMapWorkflows: IntelWorkflowDefinition[] = [
  {
    id: 'flight-response-workflow',
    title: 'Flight Response Workflow',
    description: 'Reusable workflow scaffold for map events and operator actions.',
    trigger: 'custom',
    enabledByDefault: false,
    appIds: ['flights'],
    actions: [],
  },
];

export function getIntelMapWorkflow(id: string) {
  return intelMapWorkflows.find((workflow) => workflow.id === id);
}
