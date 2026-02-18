
import { User, Ship, OperationLog, TelegramConfig } from '../types';

const API_BASE = '/api';

export const db = {
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/users`);
    return res.json();
  },
  saveUsers: async (users: User[]) => {
    await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(users)
    });
  },

  getShips: async (): Promise<Ship[]> => {
    const res = await fetch(`${API_BASE}/ships`);
    return res.json();
  },
  saveShips: async (ships: Ship[]) => {
    await fetch(`${API_BASE}/ships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ships)
    });
  },

  getLogs: async (): Promise<OperationLog[]> => {
    const res = await fetch(`${API_BASE}/logs`);
    return res.json();
  },
  saveLogs: async (logs: OperationLog[]) => {
    await fetch(`${API_BASE}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logs)
    });
  },

  getTelegramConfig: async (): Promise<TelegramConfig> => {
    const res = await fetch(`${API_BASE}/telegram`);
    return res.json();
  },
  saveTelegramConfig: async (config: TelegramConfig) => {
    await fetch(`${API_BASE}/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
  },
  
  clearAllLogs: async () => {
    await fetch(`${API_BASE}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([])
    });
  },

  login: async (userId: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password })
    });
    return res.json();
  }
};
