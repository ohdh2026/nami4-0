
export enum UserRole {
  ADMIN = '관리자',
  CAPTAIN = '선장',
  CHIEF_ENGINEER = '기관장',
  CREW = '승무원'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  joinDate: string;
  telegramChatId?: string;
}

export interface Ship {
  id: string;
  name: string;
  capacity: number;
}

export interface OperationLog {
  id: string;
  shipName: string;
  captainId: string;
  captainName: string;
  engineerId: string;
  engineerName: string;
  crewIds: string[];
  crewNames: string[];
  departureTime: string;
  arrivalTime: string;
  passengerCount: number;
  fuelLevel: number;
  memo: string;
  status: 'draft' | 'completed';
  createdAt: string;
}

export interface TelegramConfig {
  botToken: string;
  recipients: string[]; // User IDs
}

export type PageView = 
  | 'dashboard' 
  | 'user-mgmt' 
  | 'ship-mgmt' 
  | 'log-entry' 
  | 'log-list' 
  | 'telegram-settings';
