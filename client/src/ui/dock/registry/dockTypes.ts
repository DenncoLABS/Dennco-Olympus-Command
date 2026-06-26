export type DockItemKind = 'app' | 'widget' | 'action';
export type DockReturnMode = 'persistent' | 'when-closed' | 'manual';

export type DockRegistryItem = {
  id: string;
  label: string;
  icon: string;
  kind: DockItemKind;
  sourceId: string;
  group: string;
  order: number;
  returnMode?: DockReturnMode;
  draggable: boolean;
  visibleByDefault: boolean;
};

export type DockLayoutState = {
  placement: 'left' | 'center' | 'right';
  order: string[];
  hidden: string[];
};
