
import { User, Ship, UserRole, OperationLog } from './types';

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: '홍길동', role: UserRole.ADMIN, phone: '010-1234-5678', joinDate: '2023-01-01', telegramChatId: '12345678' },
  { id: 'u2', name: '김선장', role: UserRole.CAPTAIN, phone: '010-2222-3333', joinDate: '2023-05-12', telegramChatId: '87654321' },
  { id: 'u3', name: '박기관', role: UserRole.CHIEF_ENGINEER, phone: '010-4444-5555', joinDate: '2023-06-10', telegramChatId: '11223344' },
  { id: 'u4', name: '이승무', role: UserRole.CREW, phone: '010-9999-8888', joinDate: '2023-08-20' },
  { id: 'u5', name: '최선장', role: UserRole.CAPTAIN, phone: '010-1111-2222', joinDate: '2023-02-15' },
];

export const INITIAL_SHIPS: Ship[] = [
  { id: 's1', name: '탐나라호', capacity: 300 },
  { id: 's2', name: '아일래나호', capacity: 200 },
  { id: 's3', name: '가우디호', capacity: 100 },
  { id: 's4', name: '인어공주호', capacity: 100 },
];

// 기본 운항 기록을 완전히 비웁니다.
export const INITIAL_LOGS: OperationLog[] = [];
