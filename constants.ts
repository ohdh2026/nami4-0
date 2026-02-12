
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

// Generating some dummy logs
const generateDummyLogs = (): OperationLog[] => {
  const logs: OperationLog[] = [];
  const ships = ['탐나라호', '아일래나호', '가우디호', '인어공주호'];
  const captains = ['김선장', '최선장'];
  
  for (let i = 1; i <= 20; i++) {
    const isCompleted = i % 3 !== 0;
    logs.push({
      id: `log-${i}`,
      shipName: ships[i % ships.length],
      captainId: i % 2 === 0 ? 'u2' : 'u5',
      captainName: captains[i % captains.length],
      engineerId: 'u3',
      engineerName: '박기관',
      crewIds: ['u4'],
      crewNames: ['이승무'],
      departureTime: `2024-05-${String(Math.ceil(i/2)).padStart(2, '0')}T09:00`,
      arrivalTime: isCompleted ? `2024-05-${String(Math.ceil(i/2)).padStart(2, '0')}T10:30` : '',
      passengerCount: Math.floor(Math.random() * 200) + 50,
      fuelLevel: 85 - (i * 2) % 30,
      memo: i % 5 === 0 ? '기상 악화 주의' : '정상 운항',
      status: isCompleted ? 'completed' : 'draft',
      createdAt: new Date().toISOString()
    });
  }
  return logs;
};

export const INITIAL_LOGS: OperationLog[] = generateDummyLogs();
