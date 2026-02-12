
import { User, Ship, OperationLog, TelegramConfig } from '../types';
import { INITIAL_USERS, INITIAL_SHIPS, INITIAL_LOGS } from '../constants';

const KEYS = {
  USERS: 'naminara_users',
  SHIPS: 'naminara_ships',
  LOGS: 'naminara_logs',
  TELEGRAM: 'naminara_telegram'
};

export const db = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : INITIAL_USERS;
  },
  saveUsers: (users: User[]) => localStorage.setItem(KEYS.USERS, JSON.stringify(users)),

  getShips: (): Ship[] => {
    const data = localStorage.getItem(KEYS.SHIPS);
    return data ? JSON.parse(data) : INITIAL_SHIPS;
  },
  saveShips: (ships: Ship[]) => localStorage.setItem(KEYS.SHIPS, JSON.stringify(ships)),

  getLogs: (): OperationLog[] => {
    const data = localStorage.getItem(KEYS.LOGS);
    return data ? JSON.parse(data) : INITIAL_LOGS;
  },
  saveLogs: (logs: OperationLog[]) => localStorage.setItem(KEYS.LOGS, JSON.stringify(logs)),

  getTelegramConfig: (): TelegramConfig => {
    const data = localStorage.getItem(KEYS.TELEGRAM);
    return data ? JSON.parse(data) : { botToken: '', recipients: [] };
  },
  saveTelegramConfig: (config: TelegramConfig) => localStorage.setItem(KEYS.TELEGRAM, JSON.stringify(config)),
};
