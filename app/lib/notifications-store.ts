export type NotificationType = 'friend_request' | 'activity' | 'announcement';

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  createdAt: string; // ISO date
  payload?: {
    kind?: 'friend_request';
    fromUser?: { id: string; username: string; name: string };
  };
};

let notifications: AppNotification[] = [];

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeNotifications(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getNotifications(): AppNotification[] {
  return notifications.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function addNotification(n: Omit<AppNotification, 'id' | 'createdAt'> & Partial<Pick<AppNotification, 'createdAt'>>) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const createdAt = n.createdAt ?? new Date().toISOString();
  notifications = [{ id, createdAt, type: n.type, title: n.title, message: n.message, payload: n.payload }, ...notifications];
  notify();
}

export function addFriendRequestNotification(from: { id: string; username: string; name: string }) {
  addNotification({
    type: 'friend_request',
    title: `${from.name} vill bli din vän`,
    message: `@${from.username}`,
    payload: { kind: 'friend_request', fromUser: from },
  });
}

export function removeNotification(id: string) {
  notifications = notifications.filter((n) => n.id !== id);
  notify();
}

export function resetNotificationsStore() {
  notifications = [];
  listeners.clear();
}


