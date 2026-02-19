import type { ProfileBackgroundKey } from '@/src/constants/profileBackgrounds';

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string; // ISO date
  friendsCount?: number;
  backgroundKey?: ProfileBackgroundKey;
};

let me: User = {
  id: 'me',
  name: '',
  username: '',
  email: '',
  avatarUrl: undefined,
  createdAt: '2025-10-01',
  friendsCount: 0,
};

let friends: User[] = [];

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function getCurrentUser(): User {
  return me;
}

export function updateCurrentUser(update: Partial<Pick<User, 'name' | 'username' | 'avatarUrl' | 'backgroundKey'>>) {
  me = { ...me, ...update };
  notify();
}

export function setCurrentUser(user: User) {
  me = { ...user };
  notify();
}

export function getFriends(): User[] {
  return friends;
}

export function addFriend(user: User) {
  if (friends.some((f) => f.id === user.id || f.username === user.username)) return;
  friends = [user, ...friends];
  me = { ...me, friendsCount: (me.friendsCount ?? 0) + 1 };
  notify();
}

export function subscribeUsers(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getUserById(id: string): User | undefined {
  if (id === me.id) return me;
  return friends.find((f) => f.id === id);
}

export function isValidEmail(email: string): boolean {
  // Simple validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_\.]{3,}$/.test(username);
}

export type InviteTarget =
  | { type: 'friend'; userId: string }
  | { type: 'email'; email: string }
  | { type: 'username'; username: string };

export async function sendInvites(_competitionId: string, _targets: InviteTarget[]): Promise<void> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 500));
  // In a real app, send to backend
}

export function resetUserStore() {
  me = {
    id: 'me',
    name: '',
    username: '',
    email: '',
    avatarUrl: undefined,
    createdAt: '2025-10-01',
    friendsCount: 0,
  };
  friends = [];
  notify();
}


