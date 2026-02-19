export type ActionCategory = 'handlingar' | 'mat' | 'transport';

export type ActionItem = {
  id: string;
  name: string;
  category: ActionCategory;
  description?: string;
  co2EstimateKg?: number;
};

export type CategoryGroup = {
  id: ActionCategory;
  title: string;
  actions: ActionItem[];
};

const ACTIONS: ActionItem[] = [
  { id: 'pant', name: 'Panta', category: 'handlingar', description: 'Lämna burkar/flaskor' },
  { id: 'slack-standby', name: 'Stäng av standby', category: 'handlingar', description: 'Stäng av onödig elektronik' },
  { id: 'vegolunch', name: 'Ät vegetariskt', category: 'mat', description: 'Byt en måltid till vego' },
  { id: 'vegomiddag', name: 'Ät växtbaserat', category: 'mat', description: 'Välj växtbaserat idag' },
  { id: 'kollektivt', name: 'Åk kollektivt', category: 'transport', description: 'Välj buss/tåg istället för bil' },
  { id: 'cykla', name: 'Cykla/gå', category: 'transport', description: 'Ta cykel eller promenera' },
];

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

let counts: Record<string, number> = {};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeActions(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCategories(): CategoryGroup[] {
  const groups: Record<ActionCategory, CategoryGroup> = {
    handlingar: { id: 'handlingar', title: 'Handlingar', actions: [] },
    mat: { id: 'mat', title: 'Mat', actions: [] },
    transport: { id: 'transport', title: 'Transport', actions: [] },
  };
  for (const a of ACTIONS) {
    groups[a.category].actions.push(a);
  }
  return [groups.handlingar, groups.mat, groups.transport];
}

export function getTodayCount(actionId: string): number {
  const key = `${actionId}::${todayKey()}`;
  return counts[key] ?? 0;
}

export function incrementAction(actionId: string): number {
  const key = `${actionId}::${todayKey()}`;
  const current = counts[key] ?? 0;
  if (current >= 3) {
    return current;
  }
  counts[key] = current + 1;
  notify();
  return counts[key];
}

export function resetActionsStore() {
  counts = {};
  listeners.clear();
}


