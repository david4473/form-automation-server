export type UserFields = {
  name: string;
  phone: string;
};

export type User = UserFields & {
  id: string;
};

export type HistoryUser = UserFields & {
  email?: string;
  state?: string;
  branch?: string;
  rating?: number;
  feedback?: string;
};

export type HistoryEntry = {
  id: string;
  createdAt: string;
  users: HistoryUser[];
  results?: unknown[];
};
